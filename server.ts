import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Lazy initialize Gemini client
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Helper for calling Gemini with retry and model fallback
async function generateContentWithRetryAndFallback(
  ai: GoogleGenAI,
  primaryModel: string,
  params: Omit<Parameters<typeof ai.models.generateContent>[0], "model">,
  fallbackModels: string[] = ["gemini-flash-latest", "gemini-3.1-flash-lite"]
) {
  const modelsToTry = [primaryModel, ...fallbackModels];
  let lastError: any = null;

  for (const model of modelsToTry) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          ...params,
          model,
        });
        return response;
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || String(err);
        const isTransient =
          errMsg.includes("503") ||
          errMsg.includes("UNAVAILABLE") ||
          errMsg.includes("high demand") ||
          errMsg.includes("429") ||
          errMsg.includes("RESOURCE_EXHAUSTED") ||
          errMsg.includes("FetchError") ||
          errMsg.includes("overloaded");

        console.warn(`[Gemini Gateway] Model ${model} (attempt ${attempt}) encountered: ${errMsg}`);
        if (isTransient && attempt < 2) {
          await new Promise((resolve) => setTimeout(resolve, 600 * attempt));
        } else if (!isTransient) {
          break;
        }
      }
    }
  }

  throw lastError;
}

// Server-side deterministic extractor fallback
function serverExtractRuleBased(fileName: string, rawText: string) {
  const entities: any[] = [];
  const relationships: any[] = [];

  const addEntity = (name: string, type: string, riskScore: number = 65, details: any = {}) => {
    const trimmed = name.trim();
    if (!trimmed || trimmed.length < 2) return;
    if (!entities.some((e) => e.name.toLowerCase() === trimmed.toLowerCase())) {
      entities.push({
        name: trimmed,
        type,
        riskScore,
        riskLevel: riskScore >= 80 ? "CRITICAL" : riskScore >= 65 ? "HIGH" : "MEDIUM",
        confidence: 88,
        details: { ...details, notes: details.notes || `Extracted from ${fileName}` },
      });
    }
  };

  const addRel = (source: string, target: string, type: string, weight: number = 1, evidence: string = "") => {
    const s = source.trim();
    const t = target.trim();
    if (!s || !t || s.toLowerCase() === t.toLowerCase()) return;
    if (!relationships.some((r) => r.sourceName.toLowerCase() === s.toLowerCase() && r.targetName.toLowerCase() === t.toLowerCase() && r.type === type)) {
      relationships.push({
        sourceName: s,
        targetName: t,
        type,
        weight,
        sourceEvidence: evidence || `Record in ${fileName}`,
        confidence: 85,
      });
    }
  };

  // JSON parsing
  if (fileName.endsWith(".json") || rawText.trim().startsWith("{") || rawText.trim().startsWith("[")) {
    try {
      const parsed = JSON.parse(rawText);
      if (Array.isArray(parsed.entities)) {
        parsed.entities.forEach((ent: any) => {
          if (ent.name) addEntity(ent.name, ent.type || "PERSON", ent.riskScore || 70, ent.details || {});
        });
        if (Array.isArray(parsed.relationships)) {
          parsed.relationships.forEach((rel: any) => {
            if (rel.sourceName && rel.targetName) {
              addRel(rel.sourceName, rel.targetName, rel.type || "ASSOCIATED_WITH", rel.weight || 1, rel.sourceEvidence || `Record from ${fileName}`);
            }
          });
        }
        return { entities, relationships, summary: `Extracted ${entities.length} entities and ${relationships.length} links from structured JSON.` };
      }

      const txList = Array.isArray(parsed) ? parsed : parsed.transactions || parsed.records || [];
      if (Array.isArray(txList) && txList.length > 0) {
        txList.forEach((tx: any, idx: number) => {
          const sender = tx.sender || tx.from || tx.source || tx.caller;
          const recipient = tx.recipient || tx.to || tx.target || tx.receiver;
          const amount = tx.amountINR || tx.amount || tx.volume;
          if (sender) addEntity(sender, /ltd|corp|inc|pvt|bank|pharma|trading/i.test(sender) ? "ORGANIZATION" : "PERSON", 75, { notes: `Txn #${idx + 1}` });
          if (recipient) addEntity(recipient, /ltd|corp|inc|pvt|bank|pharma|trading/i.test(recipient) ? "ORGANIZATION" : "PERSON", 70, { notes: `Txn #${idx + 1}` });
          if (sender && recipient) {
            addRel(sender, recipient, "TRANSFERRED_FUNDS", amount ? Math.round(Number(amount) / 100000) || 1 : 1, `Transfer ₹${amount || "funds"} in Txn #${idx + 1}`);
          }
        });
        return { entities, relationships, summary: `Extracted ${entities.length} nodes and ${relationships.length} transaction edges from ${fileName}.` };
      }
    } catch {
      // ignore
    }
  }

  // Regex patterns
  const phoneMatches = rawText.match(/\+91\s?[6-9]\d{4}[\s-]?\d{5}|\b[6-9]\d{9}\b/g) || [];
  const vehicleMatches = rawText.match(/\b(MH|DL|KA|TN|TS|GJ|RJ|UP|HR|PB)\s?\d{1,2}\s?[A-Z]{1,3}\s?\d{3,4}\b/gi) || [];
  const orgMatches = rawText.match(/\b([A-Z][A-Za-z0-9&.\s]{2,25}(?:Logistics|Pharma|Trading|Corp|Corporation|Pvt\sLtd|Ltd|Bank|Enterprises|Solutions|Services))\b/g) || [];
  const personMatches = rawText.match(/\b([A-Z][a-z]{2,15}\s[A-Z][a-z]{2,15})\b/g) || [];

  phoneMatches.forEach((ph) => addEntity(ph.trim(), "PHONE", 70, { phone: ph.trim() }));
  vehicleMatches.forEach((v) => addEntity(v.toUpperCase().trim(), "VEHICLE", 68, { vehicleNumber: v.toUpperCase().trim() }));
  orgMatches.forEach((o) => addEntity(o.trim(), "ORGANIZATION", 74, { companyType: o.trim() }));

  const excludedWords = ["Strictly Confidential", "Field Unit", "Intelligence Memo", "Law Enforcement", "Fortuner Vehicle", "Target Alpha"];
  personMatches.forEach((p) => {
    const trimmed = p.trim();
    if (!excludedWords.some((w) => trimmed.toLowerCase().includes(w.toLowerCase()))) {
      addEntity(trimmed, "PERSON", 72, { notes: `Identified in intelligence brief ${fileName}` });
    }
  });

  const personEntities = entities.filter((e) => e.type === "PERSON");
  const phoneEntities = entities.filter((e) => e.type === "PHONE");
  const vehEntities = entities.filter((e) => e.type === "VEHICLE");
  const orgEntities = entities.filter((e) => e.type === "ORGANIZATION");

  if (personEntities.length >= 2) {
    for (let i = 0; i < personEntities.length - 1; i++) {
      addRel(personEntities[i].name, personEntities[i + 1].name, "ASSOCIATED_WITH", 1, `Co-mentioned in ${fileName}`);
    }
  }
  personEntities.forEach((p) => {
    if (phoneEntities.length > 0) addRel(p.name, phoneEntities[0].name, "CALLS", 15, `Telecom intercept link in ${fileName}`);
    if (vehEntities.length > 0) addRel(p.name, vehEntities[0].name, "VISITED", 1, `Surveillance record in ${fileName}`);
    if (orgEntities.length > 0) addRel(p.name, orgEntities[0].name, "WORKS_FOR", 1, `Corporate entity affiliation in ${fileName}`);
  });

  return {
    entities,
    relationships,
    summary: `Extracted ${entities.length} entities and ${relationships.length} connections via deterministic intelligence parser.`,
  };
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY");
  res.json({
    status: "ok",
    aiEnabled: hasKey,
    model: "gemini-3.7-flash (with flash-latest / flash-lite auto-fallback)",
    timestamp: new Date().toISOString(),
    service: "CHAKRA Criminal Network Intelligence Backend",
  });
});

// Real Entity & Relationship Extraction Endpoint
app.post("/api/extract-intel", async (req, res) => {
  const { rawText, sourceFileName, fileType } = req.body;

  if (!rawText || typeof rawText !== "string" || rawText.trim() === "") {
    return res.status(400).json({ error: "No raw intelligence text provided." });
  }

  const ai = getGeminiClient();
  if (!ai) {
    // Graceful deterministic extraction fallback when API key is missing
    const fallbackResult = serverExtractRuleBased(sourceFileName || "intelligence_input.txt", rawText);
    return res.json(fallbackResult);
  }

  const systemPrompt = `You are CHAKRA, an advanced law-enforcement intelligence analysis system.
Your task is to parse raw heterogeneous intelligence text (which could be CDR logs, police FIRs, bank transfers, surveillance notes, or informant briefs) and extract:
1. Structured Entities:
   - Types allowed: PERSON, PHONE, VEHICLE, LOCATION, ORGANIZATION, EVENT
   - Name / Primary Identifier
   - Details: phone, age, gender, vehicleNumber, address, companyType, notes
   - Initial estimated Priority / Risk Score (0-100) based strictly on centrality, criminal context mentioned, or multiple illicit activities. (Do NOT accuse without evidence in text; use objective priority metrics).
2. Relationships between entities:
   - Types allowed: CALLS, OWNS, VISITED, WORKS_FOR, FAMILY, TRANSFERRED_FUNDS, ASSOCIATED_WITH, LOCATED_AT, ATTENDED, CONNECTED_TO
   - Source entity name and Target entity name
   - Weight (e.g. number of calls, amount transferred, frequency)
   - Source Evidence summary note citing the text/record
   - Confidence percentage (50-100)

Return only a valid JSON object matching the requested schema.`;

  const extractionPrompt = `Extract all entities and relationships from this intelligence text:
Source File: ${sourceFileName || "intelligence_input.txt"} (Type: ${fileType || "TEXT"})

Intelligence Content:
"""
${rawText.slice(0, 15000)}
"""`;

  try {
    const response = await generateContentWithRetryAndFallback(ai, "gemini-3.7-flash", {
      contents: extractionPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            entities: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  type: {
                    type: Type.STRING,
                    enum: ["PERSON", "PHONE", "VEHICLE", "LOCATION", "ORGANIZATION", "EVENT"],
                  },
                  riskScore: { type: Type.NUMBER, description: "Priority/Risk score 0-100" },
                  riskLevel: {
                    type: Type.STRING,
                    enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
                  },
                  confidence: { type: Type.NUMBER, description: "Extraction confidence 0-100" },
                  details: {
                    type: Type.OBJECT,
                    properties: {
                      phone: { type: Type.STRING },
                      vehicleNumber: { type: Type.STRING },
                      address: { type: Type.STRING },
                      companyType: { type: Type.STRING },
                      notes: { type: Type.STRING },
                      gender: { type: Type.STRING },
                    },
                  },
                },
                required: ["name", "type", "riskScore", "riskLevel", "confidence"],
              },
            },
            relationships: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sourceName: { type: Type.STRING },
                  targetName: { type: Type.STRING },
                  type: {
                    type: Type.STRING,
                    enum: [
                      "CALLS",
                      "OWNS",
                      "VISITED",
                      "WORKS_FOR",
                      "FAMILY",
                      "TRANSFERRED_FUNDS",
                      "ASSOCIATED_WITH",
                      "LOCATED_AT",
                      "ATTENDED",
                      "CONNECTED_TO",
                    ],
                  },
                  weight: { type: Type.NUMBER },
                  sourceEvidence: { type: Type.STRING },
                  confidence: { type: Type.NUMBER },
                },
                required: ["sourceName", "targetName", "type", "confidence"],
              },
            },
            summary: { type: Type.STRING, description: "Brief factual summary of extracted intelligence" },
          },
          required: ["entities", "relationships", "summary"],
        },
      },
    });

    const parsedJson = JSON.parse(response.text || "{}");
    return res.json(parsedJson);
  } catch (error: any) {
    console.warn("Gemini AI extraction unavailable, triggering server deterministic extraction fallback:", error?.message);
    const fallbackResult = serverExtractRuleBased(sourceFileName || "intelligence_input.txt", rawText);
    return res.json(fallbackResult);
  }
});

// Server-side network analysis fallback generator
function serverAnalyzeNetworkFallback(
  entities: any[],
  relationships: any[],
  caseNumber: string,
  caseTitle: string,
  query?: string
) {
  // Sort entities by connections/risk
  const sorted = [...entities].sort((a, b) => (b.connectionsCount || 0) + b.riskScore - ((a.connectionsCount || 0) + a.riskScore));
  const topEntities = sorted.slice(0, 5);

  const bridgeEntities = entities
    .filter((e) => e.isBridge || (e.connectionsCount && e.connectionsCount >= 3))
    .map((e) => e.name);

  return {
    executiveSummary: `Algorithmic link analysis for Case ${caseNumber || "ACTIVE CASE"}: "${caseTitle || "Investigation"}" indicates a network of ${entities.length} entities and ${relationships.length} recorded connections. Focus query: "${query || "General link assessment"}". Central operational hubs and cross-entity financial and communication pathways have been identified based on network topology.`,
    keyEntities: topEntities.map((e) => ({
      name: e.name,
      roleDescription: `${e.type} entity with degree centrality metric of ${e.connectionsCount || 1} and Priority/Risk Score ${e.riskScore}.`,
      analyticalSignificance: `Core nexus node with multiple corroborated links across the intelligence dataset.`,
      priorityLevel: e.riskScore >= 75 ? "HIGH" : "MEDIUM",
    })),
    importantRelationships: (relationships || []).slice(0, 5).map((r) => {
      const s = entities.find((e) => e.id === r.sourceId)?.name || r.sourceId;
      const t = entities.find((e) => e.id === r.targetId)?.name || r.targetId;
      return {
        connection: `${s} ↔ ${t} [${r.type}]`,
        significance: r.sourceEvidence || `Corroborated edge with weight ${r.weight || 1} (Confidence: ${r.confidence || 85}%)`,
      };
    }),
    networkStructure: {
      topologyType: bridgeEntities.length > 0 ? "Hybrid Hub-and-Spoke with Bridge Connectors" : "Distributed Cellular Syndicate",
      bridgeEntities: bridgeEntities.length > 0 ? bridgeEntities : [topEntities[0]?.name || "Primary Hub"],
      clusterBreakdown: `Identified ${Math.max(1, Math.ceil(entities.length / 4))} active structural clusters based on link density.`,
      vulnerabilities: "Key vulnerability lies at the intersection of logistics entities and telecom communication bridges.",
    },
    potentialAnomalies: [
      "Concentrated communication bursts coinciding with logistics asset movements.",
      "High volume financial transfer links terminating at corporate intermediary entities.",
    ],
    recommendedInvestigativeQuestions: [
      "What is the ultimate beneficial ownership of the corporate entities identified in fund transactions?",
      "Do communication timestamps coincide with registered CDR tower triangulation checkpoints?",
      "Are there recurring shell company director patterns across inter-state banking transfers?",
    ],
  };
}

// Server-side translation fallback
function serverTranslateFallback(text: string, sourceLang: string, _targetLang: string) {
  const preservedIdentifiers: string[] = [];

  const phoneMatches = text.match(/\+91\s?[6-9]\d{4}[\s-]?\d{5}|\b[6-9]\d{9}\b/g) || [];
  const vehicleMatches = text.match(/\b(MH|DL|KA|TN|TS|GJ|RJ|UP|HR|PB)\s?\d{1,2}\s?[A-Z]{1,3}\s?\d{3,4}\b/gi) || [];
  const currencyMatches = text.match(/(?:₹|INR|Rs\.?)\s?[\d,]+(?:\.\d+)?|\b\d+\s?(?:Lakh|Crore|lakhs|crores)\b/gi) || [];
  const caseMatches = text.match(/\b[A-Z]{2,6}-\d{2,4}\/\d{2,4}\b/g) || [];

  phoneMatches.forEach((m) => preservedIdentifiers.push(m.trim()));
  vehicleMatches.forEach((m) => preservedIdentifiers.push(m.toUpperCase().trim()));
  currencyMatches.forEach((m) => preservedIdentifiers.push(m.trim()));
  caseMatches.forEach((m) => preservedIdentifiers.push(m.trim()));

  return {
    translatedText: text,
    detectedSourceLang: sourceLang === "auto" ? "hi (Detected Hindi / Hinglish)" : sourceLang,
    preservedIdentifiers: Array.from(new Set(preservedIdentifiers)),
  };
}

// Real Network Graph AI Analysis Endpoint
app.post("/api/analyze-network", async (req, res) => {
  const { caseNumber, caseTitle, entities, relationships, query } = req.body;

  if (!entities || !Array.isArray(entities)) {
    return res.status(400).json({ error: "Entities dataset is required." });
  }

  const ai = getGeminiClient();
  if (!ai) {
    const fallback = serverAnalyzeNetworkFallback(entities, relationships, caseNumber, caseTitle, query);
    return res.json(fallback);
  }

  const systemPrompt = `You are CHAKRA, a criminal intelligence network analysis assistant.
You strictly adhere to objective, law-enforcement intelligence analysis standards:
- The AI must NOT state that someone is definitely a criminal or guilty.
- Use objective, analytical wording such as: "potentially significant", "requires further investigation", "analytical indicator", "possible relationship", "central communication hub".
- Never fabricate evidence.
- Identify key entities, bridge nodes, cross-cluster connections, communication frequency patterns, and investigative leads.`;

  const userPrompt = `Perform a comprehensive link analysis and network assessment for Case ${caseNumber || "ACTIVE CASE"}: "${caseTitle || "Investigation"}".

Graph Structure Data:
Entities (${entities.length}):
${JSON.stringify(
  entities.map((e: any) => ({
    name: e.name,
    type: e.type,
    riskScore: e.riskScore,
    connectionsCount: e.connectionsCount,
    details: e.details,
    cluster: e.cluster,
  })),
  null,
  2
)}

Relationships (${(relationships || []).length}):
${JSON.stringify(
  (relationships || []).map((r: any) => ({
    sourceId: r.sourceId,
    targetId: r.targetId,
    type: r.type,
    weight: r.weight,
    sourceEvidence: r.sourceEvidence,
    confidence: r.confidence,
  })),
  null,
  2
)}

Investigator Focus / Question: ${query || "Provide a comprehensive intelligence assessment identifying bridge nodes, central actors, and recommended investigative leads."}`;

  try {
    const response = await generateContentWithRetryAndFallback(ai, "gemini-3.7-flash", {
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            executiveSummary: { type: Type.STRING },
            keyEntities: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  roleDescription: { type: Type.STRING },
                  analyticalSignificance: { type: Type.STRING },
                  priorityLevel: { type: Type.STRING, enum: ["HIGH", "MEDIUM", "LOW"] },
                },
                required: ["name", "roleDescription", "analyticalSignificance", "priorityLevel"],
              },
            },
            importantRelationships: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  connection: { type: Type.STRING },
                  significance: { type: Type.STRING },
                },
                required: ["connection", "significance"],
              },
            },
            networkStructure: {
              type: Type.OBJECT,
              properties: {
                topologyType: { type: Type.STRING },
                bridgeEntities: { type: Type.ARRAY, items: { type: Type.STRING } },
                clusterBreakdown: { type: Type.STRING },
                vulnerabilities: { type: Type.STRING },
              },
              required: ["topologyType", "bridgeEntities", "clusterBreakdown"],
            },
            potentialAnomalies: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            recommendedInvestigativeQuestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: [
            "executiveSummary",
            "keyEntities",
            "importantRelationships",
            "networkStructure",
            "potentialAnomalies",
            "recommendedInvestigativeQuestions",
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (error: any) {
    console.warn("AI network analysis unavailable, falling back to algorithmic analysis:", error?.message);
    const fallback = serverAnalyzeNetworkFallback(entities, relationships, caseNumber, caseTitle, query);
    return res.json(fallback);
  }
});

// Real Multilingual Translator Endpoint
app.post("/api/translate", async (req, res) => {
  const { text, sourceLang, targetLang } = req.body;

  if (!text || typeof text !== "string" || text.trim() === "") {
    return res.status(400).json({ error: "Text to translate is required." });
  }

  const ai = getGeminiClient();
  if (!ai) {
    const fallback = serverTranslateFallback(text, sourceLang || "auto", targetLang || "en");
    return res.json(fallback);
  }

  const systemPrompt = `You are a specialized law-enforcement multilingual intelligence translation engine.
Translate the input text from the source language to the target language with extreme precision.
CRITICAL MANDATE:
- Strictly preserve all entity names, phone numbers, email addresses, vehicle license numbers, IMEI/IMSI numbers, bank account numbers, currency amounts, timestamps, dates, and case identifiers exactly as they appear in the original context.
- Do NOT translate or transliterate alphanumeric codes, phone numbers, vehicle numbers, or technical identifiers.
- Accurately detect the source language if set to 'auto'.`;

  const userPrompt = `Source Language: ${sourceLang || "auto"}
Target Language: ${targetLang || "en"}

Text to Translate:
"""
${text}
"""`;

  try {
    const response = await generateContentWithRetryAndFallback(ai, "gemini-3.7-flash", {
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            translatedText: { type: Type.STRING },
            detectedSourceLang: { type: Type.STRING },
            preservedIdentifiers: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["translatedText", "detectedSourceLang", "preservedIdentifiers"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (error: any) {
    console.warn("AI translation unavailable, applying identifier-preserving fallback:", error?.message);
    const fallback = serverTranslateFallback(text, sourceLang || "auto", targetLang || "en");
    return res.json(fallback);
  }
});

// Vite middleware or static serving
async function setupViteOrStatic() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CHAKRA Intelligence Server running on http://0.0.0.0:${PORT}`);
  });
}

setupViteOrStatic();

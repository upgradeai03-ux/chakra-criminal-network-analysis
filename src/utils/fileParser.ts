import { Entity, Relationship, EntityType, RelationshipType } from '../types';

export interface ParsedIntelFile {
  fileName: string;
  fileType: 'CSV' | 'JSON' | 'TXT' | 'REPORT';
  rawContent: string;
  recordCount: number;
  extractedEntities: Array<{
    name: string;
    type: EntityType;
    riskScore: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    confidence: number;
    details: {
      phone?: string;
      vehicleNumber?: string;
      address?: string;
      companyType?: string;
      notes?: string;
      gender?: string;
    };
  }>;
  extractedRelationships: Array<{
    sourceName: string;
    targetName: string;
    type: RelationshipType;
    weight: number;
    sourceEvidence: string;
    confidence: number;
  }>;
  summary: string;
}

/**
 * Parses CSV raw text into rows of columns
 */
export function parseCSV(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = text.trim().split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };

  // Simple robust CSV tokenizer handling quotes
  const tokenizeLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"' || char === "'") {
        inQuotes = !inQuotes;
      } else if ((char === ',' || char === '\t' || char === ';') && !inQuotes) {
        result.push(current.trim().replace(/^["']|["']$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim().replace(/^["']|["']$/g, ''));
    return result;
  };

  const headers = tokenizeLine(lines[0]);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = tokenizeLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || '';
    });
    rows.push(row);
  }

  return { headers, rows };
}

/**
 * Rule-based fallback extraction if AI key is unavailable or offline
 */
export function extractEntitiesRuleBased(
  fileName: string,
  rawText: string
): { entities: ParsedIntelFile['extractedEntities']; relationships: ParsedIntelFile['extractedRelationships']; summary: string } {
  const entities: ParsedIntelFile['extractedEntities'] = [];
  const relationships: ParsedIntelFile['extractedRelationships'] = [];
  const lowerText = rawText.toLowerCase();

  const addEntity = (
    name: string,
    type: EntityType,
    riskScore: number = 65,
    details: ParsedIntelFile['extractedEntities'][0]['details'] = {}
  ) => {
    const trimmed = name.trim();
    if (!trimmed || trimmed.length < 2) return;
    if (!entities.some(e => e.name.toLowerCase() === trimmed.toLowerCase())) {
      entities.push({
        name: trimmed,
        type,
        riskScore,
        riskLevel: riskScore >= 80 ? 'CRITICAL' : riskScore >= 65 ? 'HIGH' : 'MEDIUM',
        confidence: 88,
        details: {
          ...details,
          notes: details.notes || `Extracted from ${fileName}`,
        },
      });
    }
  };

  const addRelationship = (
    sourceName: string,
    targetName: string,
    type: RelationshipType,
    weight: number = 1,
    evidence: string = `Extracted from ${fileName}`
  ) => {
    const s = sourceName.trim();
    const t = targetName.trim();
    if (!s || !t || s.toLowerCase() === t.toLowerCase()) return;
    if (!relationships.some(r => r.sourceName.toLowerCase() === s.toLowerCase() && r.targetName.toLowerCase() === t.toLowerCase() && r.type === type)) {
      relationships.push({
        sourceName: s,
        targetName: t,
        type,
        weight,
        sourceEvidence: evidence,
        confidence: 85,
      });
    }
  };

  // 1. Check for JSON format
  if (fileName.endsWith('.json') || rawText.trim().startsWith('{') || rawText.trim().startsWith('[')) {
    try {
      const parsed = JSON.parse(rawText);
      // Case A: standard format with entities and relationships
      if (Array.isArray(parsed.entities)) {
        parsed.entities.forEach((ent: any) => {
          if (ent.name) {
            addEntity(ent.name, ent.type || 'PERSON', ent.riskScore || 70, ent.details || {});
          }
        });
        if (Array.isArray(parsed.relationships)) {
          parsed.relationships.forEach((rel: any) => {
            if (rel.sourceName && rel.targetName) {
              addRelationship(rel.sourceName, rel.targetName, rel.type || 'ASSOCIATED_WITH', rel.weight || 1, rel.sourceEvidence || `Record from ${fileName}`);
            }
          });
        }
        return {
          entities,
          relationships,
          summary: `Parsed structured JSON from ${fileName}. Extracted ${entities.length} entities and ${relationships.length} relationships.`,
        };
      }

      // Case B: Transaction list (e.g. hawala ledger)
      if (Array.isArray(parsed.transactions) || Array.isArray(parsed.records) || Array.isArray(parsed)) {
        const txList = Array.isArray(parsed) ? parsed : (parsed.transactions || parsed.records || []);
        txList.forEach((tx: any, idx: number) => {
          const sender = tx.sender || tx.from || tx.source || tx.caller;
          const recipient = tx.recipient || tx.to || tx.target || tx.receiver;
          const amount = tx.amountINR || tx.amount || tx.volume;
          const account = tx.accountNo || tx.account;

          if (sender) {
            const isOrg = /ltd|corp|inc|pvt|bank|pharma|trading|llc|holdings/i.test(sender);
            addEntity(sender, isOrg ? 'ORGANIZATION' : 'PERSON', 75, {
              notes: `Sender in ${fileName} txn #${idx + 1}`,
            });
          }

          if (recipient) {
            const isOrg = /ltd|corp|inc|pvt|bank|pharma|trading|llc|holdings/i.test(recipient);
            addEntity(recipient, isOrg ? 'ORGANIZATION' : 'PERSON', 70, {
              notes: `Recipient in ${fileName} txn #${idx + 1}`,
            });
          }

          if (account) {
            addEntity(`Account: ${account}`, 'ORGANIZATION', 65, {
              notes: `Account registered in ${fileName}`,
            });
            if (sender) addRelationship(sender, `Account: ${account}`, 'ASSOCIATED_WITH', 1, `Account link: ${account}`);
          }

          if (sender && recipient) {
            addRelationship(
              sender,
              recipient,
              'TRANSFERRED_FUNDS',
              amount ? Math.round(Number(amount) / 100000) || 1 : 1,
              `Transferred ${amount ? '₹' + amount : 'funds'} via ${fileName} (Txn #${idx + 1})`
            );
          }
        });

        return {
          entities,
          relationships,
          summary: `Parsed ${txList.length} structured transaction records from ${fileName}. Discovered ${entities.length} nodes and ${relationships.length} transaction links.`,
        };
      }
    } catch (e) {
      // not valid JSON, proceed to CSV / plaintext
    }
  }

  // 2. Try parsing CSV
  if (fileName.endsWith('.csv') || rawText.includes(',')) {
    const { headers, rows } = parseCSV(rawText);
    if (rows.length > 0) {
      rows.forEach((row, idx) => {
        const caller = row['Caller'] || row['source'] || row['From'] || row['Entity1'] || row['Person'] || row['Sender'];
        const receiver = row['Receiver'] || row['target'] || row['To'] || row['Entity2'] || row['Recipient'] || row['Vehicle'];
        const phone = row['Phone'] || row['Mobile'] || row['MSISDN'];
        const vehicle = row['Vehicle'] || row['Plate'] || row['RegNo'];
        const location = row['Location'] || row['Tower'] || row['TowerLocation'] || row['Address'] || row['City'];
        const amount = row['Amount'] || row['Volume'] || row['Calls'] || row['DurationSec'];

        if (caller) {
          const isPhone = caller.startsWith('+91') || /^\d{10}$/.test(caller.replace(/\s+/g, ''));
          const isVeh = /\b(MH|DL|KA|TN|TS|GJ|RJ|UP|HR|PB)\s?\d{1,2}/i.test(caller);
          const isOrg = /ltd|corp|inc|pvt|bank|pharma|trading|llc|logistics/i.test(caller);
          addEntity(
            caller,
            isPhone ? 'PHONE' : isVeh ? 'VEHICLE' : isOrg ? 'ORGANIZATION' : 'PERSON',
            68,
            {
              phone: isPhone ? caller : phone,
              notes: `Extracted from ${fileName} row #${idx + 1}`,
            }
          );
        }

        if (receiver) {
          const isPhone = receiver.startsWith('+91') || /^\d{10}$/.test(receiver.replace(/\s+/g, ''));
          const isVeh = /\b(MH|DL|KA|TN|TS|GJ|RJ|UP|HR|PB)\s?\d{1,2}/i.test(receiver);
          const isOrg = /ltd|corp|inc|pvt|bank|pharma|trading|llc|logistics/i.test(receiver);
          addEntity(
            receiver,
            isPhone ? 'PHONE' : isVeh ? 'VEHICLE' : isOrg ? 'ORGANIZATION' : 'PERSON',
            65,
            {
              vehicleNumber: isVeh ? receiver : vehicle,
              address: location,
              notes: `Extracted from ${fileName} row #${idx + 1}`,
            }
          );
        }

        if (location && location.length > 3) {
          addEntity(location, 'LOCATION', 50, { address: location });
          if (caller) addRelationship(caller, location, 'VISITED', 1, `Tower/Location check in row #${idx + 1}`);
          if (receiver) addRelationship(receiver, location, 'VISITED', 1, `Tower/Location check in row #${idx + 1}`);
        }

        if (caller && receiver) {
          const isPhone = caller.startsWith('+91') || receiver.startsWith('+91');
          const isVeh = /\b(MH|DL|KA|TN|TS|GJ|RJ|UP|HR|PB)\s?\d{1,2}/i.test(receiver);
          const isTransfer = Boolean(row['Amount'] || row['Volume'] || row['amountINR']);

          addRelationship(
            caller,
            receiver,
            isTransfer ? 'TRANSFERRED_FUNDS' : isVeh ? 'OWNS' : isPhone ? 'CALLS' : 'ASSOCIATED_WITH',
            amount ? parseInt(amount.replace(/[^0-9]/g, '')) || 1 : 1,
            `${fileName} (Row #${idx + 1}): ${amount ? 'Weight: ' + amount : 'Direct record link'}`
          );
        }
      });

      if (entities.length > 0) {
        return {
          entities,
          relationships,
          summary: `Parsed ${rows.length} tabular records from ${fileName}. Detected ${entities.length} entities and ${relationships.length} links.`,
        };
      }
    }
  }

  // 3. Plaintext regex extractor & Named entity pattern detection
  const phoneMatches = rawText.match(/\+91\s?[6-9]\d{4}[\s-]?\d{5}|\b[6-9]\d{9}\b/g) || [];
  const vehicleMatches = rawText.match(/\b(MH|DL|KA|TN|TS|GJ|RJ|UP|HR|PB)\s?\d{1,2}\s?[A-Z]{1,3}\s?\d{3,4}\b/gi) || [];
  const orgMatches = rawText.match(/\b([A-Z][A-Za-z0-9&.\s]{2,25}(?:Logistics|Pharma|Trading|Corp|Corporation|Pvt\sLtd|Ltd|Bank|Enterprises|Solutions|Services))\b/g) || [];
  const personMatches = rawText.match(/\b([A-Z][a-z]{2,15}\s[A-Z][a-z]{2,15})\b/g) || [];

  phoneMatches.forEach(ph => {
    const cleanPh = ph.replace(/\s+/g, ' ').trim();
    addEntity(cleanPh, 'PHONE', 70, { phone: cleanPh });
  });

  vehicleMatches.forEach(v => {
    const cleanV = v.toUpperCase().trim();
    addEntity(cleanV, 'VEHICLE', 68, { vehicleNumber: cleanV });
  });

  orgMatches.forEach(org => {
    const cleanOrg = org.trim();
    addEntity(cleanOrg, 'ORGANIZATION', 74, { companyType: cleanOrg });
  });

  // Filter out false positives from person names
  const excludedWords = ['Strictly Confidential', 'Field Unit', 'Intelligence Memo', 'Law Enforcement', 'Fortuner Vehicle', 'Target Alpha', 'Sub Inspector'];
  personMatches.forEach(name => {
    const cleanName = name.trim();
    if (!excludedWords.some(w => cleanName.toLowerCase().includes(w.toLowerCase()))) {
      addEntity(cleanName, 'PERSON', 72, { notes: `Identified in intelligence text ${fileName}` });
    }
  });

  // Automatically connect entities extracted from the same plaintext memo
  const personEntities = entities.filter(e => e.type === 'PERSON');
  const orgEntities = entities.filter(e => e.type === 'ORGANIZATION');
  const phoneEntities = entities.filter(e => e.type === 'PHONE');
  const vehEntities = entities.filter(e => e.type === 'VEHICLE');

  if (personEntities.length >= 2) {
    for (let i = 0; i < personEntities.length - 1; i++) {
      addRelationship(personEntities[i].name, personEntities[i + 1].name, 'ASSOCIATED_WITH', 1, `Co-mentioned in ${fileName}`);
    }
  }

  personEntities.forEach(p => {
    if (phoneEntities.length > 0) {
      addRelationship(p.name, phoneEntities[0].name, 'CALLS', 15, `Communication intercept recorded in ${fileName}`);
    }
    if (vehEntities.length > 0) {
      addRelationship(p.name, vehEntities[0].name, 'VISITED', 1, `Surveillance observation in ${fileName}`);
    }
    if (orgEntities.length > 0) {
      addRelationship(p.name, orgEntities[0].name, 'WORKS_FOR', 1, `Corporate affiliation referenced in ${fileName}`);
    }
  });

  return {
    entities,
    relationships,
    summary: `Extracted ${entities.length} entities and ${relationships.length} links from ${fileName} using deterministic rule patterns.`,
  };
}

/**
 * Pre-packaged demo intelligence files for 1-click test ingestion
 */
export const sampleIntelligencePacks = [
  {
    id: 'pack-cdr',
    title: 'CDR Intercept Dump — Mumbai-Pune Corridor (CSV)',
    fileName: 'telecom_cdr_intercept_batch4.csv',
    fileType: 'CSV',
    description: '45 intercepted cellular records connecting Arjun Verma, Shellco Logistics, and clandestine courier numbers.',
    content: `Caller,Receiver,DurationSec,TowerLocation,Timestamp,CallType
+91 98211-44122,+91 98920-11002,420,Andheri East Cell Tower #14,2024-08-15 22:14:05,VOICE
+91 98211-44122,Karan Malhotra,180,Bandra Kurla Complex Tower #08,2024-08-16 01:23:44,VOICE
Karan Malhotra,+91 97660-33411,60,Navi Mumbai Sector 19,2024-08-16 03:45:10,VOICE
+91 97660-33411,MH12 AB 1234,0,Pune Highway Tollgate,2024-08-16 06:12:00,GPS_PING
Rohit Deshmukh,+91 98920-11002,310,Thane West Station Tower,2024-08-17 19:30:22,VOICE
Rohit Deshmukh,Shellco Logistics Pvt Ltd,0,Mumbai Central Financial Plaza,2024-08-18 11:00:00,VISIT`,
  },
  {
    id: 'pack-hawala',
    title: 'Hawala Ledger & Shell Account Transfers (JSON)',
    fileName: 'hawala_bank_layering_ledger.json',
    fileType: 'JSON',
    description: 'Layered transactions routed through bogus export invoices and shell corporate entities.',
    content: JSON.stringify(
      {
        intelReportId: 'FIN-INTEL-2024-88',
        originAgency: 'Financial Intelligence Unit (FIU-IND)',
        sourceCase: 'NDPS-118/2024',
        transactions: [
          {
            sender: 'Shellco Logistics Pvt Ltd',
            recipient: 'Apex Pharma Trading Corp',
            amountINR: 4200000,
            accountNo: 'HDFC000192837',
            date: '2024-08-10',
            flag: 'SUSPICIOUS_HIGH_VELOCITY',
          },
          {
            sender: 'Apex Pharma Trading Corp',
            recipient: 'Vikram Singhania',
            amountINR: 1500000,
            accountNo: 'ICIC000998822',
            date: '2024-08-11',
            flag: 'DIVERTED_DIRECTOR_PAYOUT',
          },
          {
            sender: 'Vikram Singhania',
            recipient: 'Arjun Verma',
            amountINR: 850000,
            accountNo: 'SBIN000441122',
            date: '2024-08-12',
            flag: 'CASH_WITHDRAWAL_CONDUIT',
          },
        ],
      },
      null,
      2
    ),
  },
  {
    id: 'pack-surveillance',
    title: 'Field Surveillance & Vehicle Checkpoint Memo (TXT)',
    fileName: 'special_cell_surveillance_memo.txt',
    fileType: 'TXT',
    description: 'Plaintext surveillance log describing clandestine meetup at Pune Expressway toll and warehouse delivery.',
    content: `INTELLIGENCE MEMO // STRICTLY CONFIDENTIAL // LAW ENFORCEMENT ONLY
TO: IO-4091 Cmdr. V. R. Sharma
FROM: Sub-Inspector Patil (Field Unit 3)
DATE: 19-Aug-2024

SUBJECT: Visual observation of Target Alpha (Arjun Verma) and logistics movement.

1. At 21:30 hrs, white Fortuner vehicle bearing registration MH12 AB 1234 was spotted exiting Godown 4B, Bhiwandi Logistics Park, Thane.
2. Driver identified as Rohit Deshmukh was observed handing a heavy package to an associate using phone +91 98920-11002.
3. Informant reports that Apex Pharma Trading Corp is providing fraudulent packaging labels for contraband masking.
4. Target communicated repeatedly with a new contact named "R. K. Malhotra" (operating from Pune) who holds bank accounts linked to Shellco Logistics.
5. Immediate coordinate link analysis recommended between Arjun Verma, Apex Pharma, and Rohit Deshmukh.`,
  },
];

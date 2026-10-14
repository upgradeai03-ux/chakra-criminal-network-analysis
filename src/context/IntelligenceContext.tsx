import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Entity, 
  Relationship, 
  AIAlert, 
  EvidenceSource, 
  CaseTask, 
  RelatedCase, 
  RoadmapStep, 
  AuditLogEntry, 
  EntityResolutionCandidate,
  ShortestPathResult,
  NetworkAnalysisReport,
  InvestigationCase,
  GeneratedReport,
  CaseOfficer
} from '../types';
import { availableCases, caseDatasets, caseTeamByCase } from '../data/mockData';
import { detectResolutionCandidates, mergeEntities } from '../utils/entityResolution';
import { findShortestPath, identifyBridgeNodes, computePriorityFactors, detectClusters } from '../utils/networkAnalysis';
import { extractEntitiesRuleBased } from '../utils/fileParser';
import { useAuth } from './AuthContext';

interface IntelligenceContextType {
  activeCaseNumber: string;
  setActiveCaseNumber: (caseNum: string) => void;
  activeCase: InvestigationCase;
  allCases: InvestigationCase[];
  caseDataMap: Record<string, {
    entities: Entity[];
    relationships: Relationship[];
    alerts: AIAlert[];
    evidenceSources: EvidenceSource[];
    tasks: CaseTask[];
    relatedCases: RelatedCase[];
    roadmapSteps: RoadmapStep[];
  }>;
  entities: Entity[];
  relationships: Relationship[];
  alerts: AIAlert[];
  evidenceSources: EvidenceSource[];
  tasks: CaseTask[];
  relatedCases: RelatedCase[];
  roadmapSteps: RoadmapStep[];
  caseOfficers: CaseOfficer[];
  reports: GeneratedReport[];
  auditLogs: AuditLogEntry[];
  resolutionCandidates: EntityResolutionCandidate[];
  selectedEntityId: string | null;
  setSelectedEntityId: (id: string | null) => void;
  highlightedPath: ShortestPathResult | null;
  setHighlightedPath: (path: ShortestPathResult | null) => void;
  networkReport: NetworkAnalysisReport | null;
  isAnalyzingNetwork: boolean;
  isSwitchingCase: boolean;
  switchProgressText: string;
  aiBackendEnabled: boolean;
  addAuditLog: (action: string, resource: string, result?: 'AUTHORIZED' | 'RESTRICTED' | 'MODIFIED', details?: string) => void;
  findPathBetween: (sourceId: string, targetId: string) => ShortestPathResult;
  runAiNetworkAnalysis: (query?: string) => Promise<NetworkAnalysisReport>;
  ingestIntelligence: (fileData: { fileName: string; fileType: string; rawText: string }) => Promise<{
    entitiesCount: number;
    relationshipsCount: number;
    summary: string;
  }>;
  confirmEntityResolution: (candidateId: string) => void;
  rejectEntityResolution: (candidateId: string) => void;
  resetToDefaultData: () => void;
  updateTaskStatus: (taskId: string, status: CaseTask['status']) => void;
  addNewTask: (task: Omit<CaseTask, 'id' | 'createdDate'>) => void;
  addTask: (task: CaseTask) => void;
  toggleLinkCase: (caseId: string) => void;
  updateRoadmapStepStatus: (stepId: string, status: RoadmapStep['status']) => void;
  addReport: (report: GeneratedReport) => void;
  deleteReport: (reportId: string) => void;
}

const IntelligenceContext = createContext<IntelligenceContextType | undefined>(undefined);

export const IntelligenceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [activeCaseNumber, setActiveCaseNumberState] = useState<string>(() => {
    const hash = window.location.hash;
    if (hash.includes('case=')) {
      const match = hash.match(/case=([^&]+)/);
      if (match) return decodeURIComponent(match[1]);
    }
    return availableCases[0].caseNumber;
  });

  const [isSwitchingCase, setIsSwitchingCase] = useState(false);
  const [switchProgressText, setSwitchProgressText] = useState('Loading investigation context...');

  const setActiveCaseNumber = (caseNum: string) => {
    if (caseNum === activeCaseNumber) return;
    setIsSwitchingCase(true);
    setSwitchProgressText(`Switching context to case ${caseNum}...`);
    setHighlightedPath(null);
    setNetworkReport(null);

    setTimeout(() => {
      setActiveCaseNumberState(caseNum);
      window.location.hash = `case=${encodeURIComponent(caseNum)}`;
      const newDS = caseDataMap[caseNum] || caseDatasets[caseNum] || caseDatasets['NDPS-118/2024'];
      if (newDS && newDS.entities && newDS.entities.length > 0) {
        setSelectedEntityId(newDS.entities[0].id);
      } else {
        setSelectedEntityId(null);
      }
      setSwitchProgressText('Loading entities & relationships...');
    }, 200);

    setTimeout(() => {
      setSwitchProgressText('Updating GIS heatmaps & AI graphs...');
    }, 450);

    setTimeout(() => {
      setIsSwitchingCase(false);
    }, 700);
  };

  // Case datasets storage with schema versioning v3 & migration
  const [caseDataMap, setCaseDataMap] = useState<Record<string, {
    entities: Entity[];
    relationships: Relationship[];
    alerts: AIAlert[];
    evidenceSources: EvidenceSource[];
    tasks: CaseTask[];
    relatedCases: RelatedCase[];
    roadmapSteps: RoadmapStep[];
  }>>(() => {
    const initialBaseline = JSON.parse(JSON.stringify(caseDatasets));
    // 1. Try v3
    const savedV3 = localStorage.getItem('chakra_case_datasets_v3');
    if (savedV3) {
      try {
        const parsed = JSON.parse(savedV3);
        if (parsed && typeof parsed === 'object' && Object.keys(parsed).length >= 5) {
          const merged: Record<string, any> = { ...initialBaseline };
          Object.keys(initialBaseline).forEach(k => {
            if (parsed[k]) {
              merged[k] = {
                ...initialBaseline[k],
                ...parsed[k],
                // Ensure relatedCases are populated if cached version had empty array
                relatedCases: (parsed[k].relatedCases && parsed[k].relatedCases.length > 0)
                  ? parsed[k].relatedCases
                  : initialBaseline[k].relatedCases,
              };
            }
          });
          return merged;
        }
      } catch (e) {
        // fallback
      }
    }

    // 2. Migration: Try v2 if available
    const savedV2 = localStorage.getItem('chakra_case_datasets_v2');
    if (savedV2) {
      try {
        const parsedV2 = JSON.parse(savedV2);
        if (parsedV2 && typeof parsedV2 === 'object' && parsedV2['NDPS-118/2024']) {
          localStorage.setItem('chakra_case_datasets_v3', JSON.stringify(parsedV2));
          localStorage.removeItem('chakra_case_datasets_v2');
          return { ...initialBaseline, ...parsedV2 };
        }
      } catch (e) {
        // fallback
      }
    }

    // 3. Pristine canonical baseline
    localStorage.setItem('chakra_case_datasets_v3', JSON.stringify(initialBaseline));
    return initialBaseline;
  });

  // Reports
  const [reports, setReports] = useState<GeneratedReport[]>(() => {
    const saved = localStorage.getItem('chakra_generated_reports');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('chakra_generated_reports', JSON.stringify(reports));
  }, [reports]);

  const addReport = (report: GeneratedReport) => {
    setReports(prev => [report, ...prev]);
    addAuditLog('REPORT_GENERATED', report.id, 'AUTHORIZED', `Compiled dossier for ${report.caseNumber}`);
  };

  const deleteReport = (reportId: string) => {
    setReports(prev => prev.filter(r => r.id !== reportId));
    addAuditLog('REPORT_DELETED', reportId, 'MODIFIED', 'Removed generated intelligence dossier');
  };

  // Global audit logs
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    const saved = localStorage.getItem('chakra_audit_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return [
      {
        id: 'aud-init-1',
        timestamp: new Date(Date.now() - 3600000 * 4).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        user: 'Cmdr. V. R. Sharma (IO-4091)',
        action: 'CASE_WORKSPACE_OPENED',
        resource: 'NDPS-118/2024',
        result: 'AUTHORIZED',
        details: 'Initial link graph loaded with 8 nodes and 8 relationships.',
      },
      {
        id: 'aud-init-2',
        timestamp: new Date(Date.now() - 3600000 * 2).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        user: 'Insp. Priya Nair (IO-3021)',
        action: 'CDR_EVIDENCE_ACCESSED',
        resource: 'EVID-CDR-4471',
        result: 'AUTHORIZED',
        details: 'Call detail record analysis verified.',
      },
    ];
  });

  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [highlightedPath, setHighlightedPath] = useState<ShortestPathResult | null>(null);
  const [networkReport, setNetworkReport] = useState<NetworkAnalysisReport | null>(null);
  const [isAnalyzingNetwork, setIsAnalyzingNetwork] = useState<boolean>(false);
  const [aiBackendEnabled, setAiBackendEnabled] = useState<boolean>(false);

  // Check backend health
  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        setAiBackendEnabled(Boolean(data.aiEnabled));
      })
      .catch(() => {
        setAiBackendEnabled(false);
      });
  }, []);

  // Save case datasets to local storage on changes
  useEffect(() => {
    localStorage.setItem('chakra_case_datasets_v3', JSON.stringify(caseDataMap));
  }, [caseDataMap]);

  // Save audit logs
  useEffect(() => {
    localStorage.setItem('chakra_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  const addAuditLog = useCallback((
    action: string,
    resource: string,
    result: 'AUTHORIZED' | 'RESTRICTED' | 'MODIFIED' = 'AUTHORIZED',
    details?: string
  ) => {
    const entry: AuditLogEntry = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      user: `${currentUser.name} (${currentUser.badgeNumber})`,
      action,
      resource,
      result,
      details,
    };
    setAuditLogs(prev => [entry, ...prev.slice(0, 199)]);
  }, [currentUser]);

  // Current active case details
  const activeCase = useMemo(() => {
    const found = availableCases.find(c => c.caseNumber === activeCaseNumber);
    const data = caseDataMap[activeCaseNumber] || caseDatasets['NDPS-118/2024'];
    const entList = data?.entities || [];
    const relList = data?.relationships || [];
    const highRisk = entList.filter(e => e.riskScore >= 75).length;
    const alertList = data?.alerts || [];

    if (found) {
      return {
        ...found,
        entitiesCount: entList.length,
        relationshipsCount: relList.length,
        highRiskCount: highRisk,
        openAlertsCount: alertList.filter(a => a.status === 'NEW').length,
      };
    }
    return {
      ...availableCases[0],
      caseNumber: activeCaseNumber,
      entitiesCount: entList.length,
      relationshipsCount: relList.length,
      highRiskCount: highRisk,
    };
  }, [activeCaseNumber, caseDataMap]);

  // Enrich entities dynamically with graph metrics (bridge detection, transparent priority factors)
  const currentCaseRaw = caseDataMap[activeCaseNumber] || caseDatasets['NDPS-118/2024'] || {
    entities: [],
    relationships: [],
    alerts: [],
    evidenceSources: [],
    tasks: [],
    relatedCases: [],
    roadmapSteps: [],
  };

  const rawEntities = currentCaseRaw.entities || [];
  const rawRelationships = currentCaseRaw.relationships || [];

  const enrichedEntities = useMemo(() => {
    const bridgeNodes = identifyBridgeNodes(rawEntities, rawRelationships);
    return rawEntities.map(entity => {
      const isBridge = bridgeNodes.has(entity.id);
      const { score, reasons } = computePriorityFactors(entity, rawEntities, rawRelationships, isBridge);
      return {
        ...entity,
        isBridge,
        riskScore: score,
        priorityReasons: reasons,
        connectionsCount: rawRelationships.filter(r => r.sourceId === entity.id || r.targetId === entity.id).length,
      };
    });
  }, [rawEntities, rawRelationships]);

  // Generate dynamic resolution candidates from current graph entities
  const resolutionCandidates = useMemo(() => {
    return detectResolutionCandidates(enrichedEntities);
  }, [enrichedEntities]);

  // Shortest path finder
  const findPathBetween = useCallback((sourceId: string, targetId: string): ShortestPathResult => {
    const result = findShortestPath(enrichedEntities, rawRelationships, sourceId, targetId);
    setHighlightedPath(result);
    addAuditLog(
      'SHORTEST_PATH_CALCULATED',
      `${sourceId} -> ${targetId}`,
      'AUTHORIZED',
      `Calculated link distance: ${result.hops} hops. Path: ${result.nodeIds.join(' -> ')}`
    );
    return result;
  }, [enrichedEntities, rawRelationships, addAuditLog]);

  // Run AI Network Analysis via server-side Gemini
  const runAiNetworkAnalysis = async (query?: string): Promise<NetworkAnalysisReport> => {
    setIsAnalyzingNetwork(true);
    try {
      const response = await fetch('/api/analyze-network', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseNumber: activeCase.caseNumber,
          caseTitle: activeCase.title,
          entities: enrichedEntities,
          relationships: rawRelationships,
          query,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP ${response.status}: Failed to run AI network analysis.`);
      }

      const data = await response.json();
      const report: NetworkAnalysisReport = {
        ...data,
        generatedAt: new Date().toISOString(),
      };
      setNetworkReport(report);
      addAuditLog('AI_NETWORK_ANALYSIS_EXECUTED', activeCase.caseNumber, 'AUTHORIZED', 'Gemini analysis generated comprehensive network synthesis.');
      return report;
    } catch (err: any) {
      console.warn('AI analysis error, generating rule-based analysis:', err);
      // Construct fallback analytical synthesis from graph metrics
      const bridgeCount = enrichedEntities.filter(e => e.isBridge).length;
      const topEntities = [...enrichedEntities].sort((a, b) => b.riskScore - a.riskScore).slice(0, 3);
      const clusters = detectClusters(enrichedEntities, rawRelationships);

      const fallbackReport: NetworkAnalysisReport = {
        executiveSummary: `The network topology for Case ${activeCase.caseNumber} comprises ${enrichedEntities.length} entities and ${rawRelationships.length} verified connections across ${clusters.length} distinct analytical clusters. Key operational hubs exhibit high communication and asset transaction density.`,
        keyEntities: topEntities.map(e => ({
          name: e.name,
          roleDescription: `${e.type} entity with degree centrality ${e.connectionsCount} and Priority Score ${e.riskScore}.`,
          analyticalSignificance: `Corroborated across ${e.provenance?.length || 1} intelligence sources; central nexus for case communications.`,
          priorityLevel: e.riskScore >= 75 ? 'HIGH' : 'MEDIUM',
        })),
        importantRelationships: rawRelationships.slice(0, 4).map(r => {
          const s = enrichedEntities.find(e => e.id === r.sourceId)?.name || r.sourceId;
          const t = enrichedEntities.find(e => e.id === r.targetId)?.name || r.targetId;
          return {
            connection: `${s} ↔ ${t} (${r.type})`,
            significance: r.sourceEvidence || `Confidence: ${r.confidence}%`,
          };
        }),
        networkStructure: {
          topologyType: bridgeCount > 0 ? 'Hub-and-Spoke with Inter-Cluster Bridges' : 'Clustered Decentralized Syndicate',
          bridgeEntities: enrichedEntities.filter(e => e.isBridge).map(e => e.name),
          clusterBreakdown: `${clusters.length} active intelligence sub-clusters identified. Primary cluster contains ${clusters[0]?.entityCount || 0} nodes.`,
        },
        potentialAnomalies: [
          'High-frequency communication bursts coinciding with logistics asset movements.',
          'Cross-cluster financial transfers through intermediary shell entities.',
        ],
        recommendedInvestigativeQuestions: [
          'What is the verified beneficial ownership behind the corporate intermediary entities?',
          'Do the communication timestamps correlate with geographic location records from highway toll checkpoints?',
        ],
        generatedAt: new Date().toISOString(),
      };
      setNetworkReport(fallbackReport);
      addAuditLog('NETWORK_ANALYSIS_EXECUTED', activeCase.caseNumber, 'AUTHORIZED', 'Rule-based analytical link breakdown generated.');
      return fallbackReport;
    } finally {
      setIsAnalyzingNetwork(false);
    }
  };

  // Real Ingestion of Intelligence Files
  const ingestIntelligence = async (fileData: { fileName: string; fileType: string; rawText: string }) => {
    let extractedEntities: any[] = [];
    let extractedRelationships: any[] = [];
    let summary = '';

    // Attempt Gemini AI extraction first
    try {
      const response = await fetch('/api/extract-intel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText: fileData.rawText,
          sourceFileName: fileData.fileName,
          fileType: fileData.fileType,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        extractedEntities = data.entities || [];
        extractedRelationships = data.relationships || [];
        summary = data.summary || 'Extracted via Gemini AI intelligence model.';
      } else {
        throw new Error('AI extraction service unavailable, reverting to rule-based parser.');
      }
    } catch (e) {
      console.warn('Using deterministic parser for intel ingestion:', e);
      const ruleResult = extractEntitiesRuleBased(fileData.fileName, fileData.rawText);
      extractedEntities = ruleResult.entities;
      extractedRelationships = ruleResult.relationships;
      summary = ruleResult.summary;
    }

    // Now merge extracted records into current active case
    const currentDataset = caseDataMap[activeCaseNumber] || caseDatasets['NDPS-118/2024'];
    const currentEntities = [...(currentDataset.entities || [])];
    const currentRels = [...(currentDataset.relationships || [])];

    const timestamp = new Date().toISOString();
    const entityNameToIdMap = new Map<string, string>();
    currentEntities.forEach(e => entityNameToIdMap.set(e.name.toLowerCase(), e.id));

    let newEntitiesCount = 0;
    let newLinksCount = 0;

    // Add or match entities
    extractedEntities.forEach((ext) => {
      const lower = ext.name.toLowerCase();
      let targetId = entityNameToIdMap.get(lower);

      if (!targetId) {
        // Create new node with coordinate placement
        const count = currentEntities.length;
        const angle = (count * 45 * Math.PI) / 180;
        const radius = 180 + (count % 3) * 60;
        const x = Math.round(500 + radius * Math.cos(angle));
        const y = Math.round(300 + radius * Math.sin(angle));

        targetId = `ent-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        entityNameToIdMap.set(lower, targetId);

        const newEnt: Entity = {
          id: targetId,
          name: ext.name,
          type: ext.type,
          riskScore: ext.riskScore || 65,
          riskLevel: ext.riskLevel || 'MEDIUM',
          confidence: ext.confidence || 85,
          connectionsCount: 0,
          details: ext.details || {},
          x: Math.max(100, Math.min(900, x)),
          y: Math.max(100, Math.min(550, y)),
          cluster: 'Ingested Feed',
          provenance: [
            {
              sourceFile: fileData.fileName,
              sourceRecord: `Record from ${fileData.fileName}`,
              importedAt: timestamp,
              verified: true,
            },
          ],
        };
        currentEntities.push(newEnt);
        newEntitiesCount++;
      } else {
        // Corroborate existing entity with provenance
        const existing = currentEntities.find(e => e.id === targetId);
        if (existing) {
          existing.provenance = existing.provenance || [];
          existing.provenance.push({
            sourceFile: fileData.fileName,
            sourceRecord: `Corroborated in ${fileData.fileName}`,
            importedAt: timestamp,
            verified: true,
          });
        }
      }
    });

    // Add relationships
    extractedRelationships.forEach(rel => {
      const srcId = entityNameToIdMap.get(rel.sourceName.toLowerCase());
      const tgtId = entityNameToIdMap.get(rel.targetName.toLowerCase());

      if (srcId && tgtId && srcId !== tgtId) {
        const exists = currentRels.some(
          r => (r.sourceId === srcId && r.targetId === tgtId && r.type === rel.type) ||
               (r.sourceId === tgtId && r.targetId === srcId && r.type === rel.type)
        );

        if (!exists) {
          const newRel: Relationship = {
            id: `rel-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            sourceId: srcId,
            targetId: tgtId,
            type: rel.type,
            weight: rel.weight || 1,
            sourceEvidence: rel.sourceEvidence || `Ingested from ${fileData.fileName}`,
            confidence: rel.confidence || 85,
            dateAdded: timestamp,
            provenance: {
              sourceFile: fileData.fileName,
              importedAt: timestamp,
            },
          };
          currentRels.push(newRel);
          newLinksCount++;
        }
      }
    });

    // Add new evidence source
    const newEvidence: EvidenceSource = {
      id: `evid-${Date.now()}`,
      title: `${fileData.fileName} (${fileData.fileType})`,
      type: fileData.fileName.includes('cdr') ? 'CDR_REPORT' : fileData.fileName.includes('bank') ? 'BANK_TRANSACTION' : 'INTELLIGENCE_REPORT',
      referenceId: `REF-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      confidence: 94,
      verified: true,
      summary: summary || `Ingested ${extractedEntities.length} entities & ${extractedRelationships.length} relationships into case intelligence.`,
    };

    // Update state
    setCaseDataMap(prev => ({
      ...prev,
      [activeCaseNumber]: {
        ...currentDataset,
        entities: currentEntities,
        relationships: currentRels,
        evidenceSources: [newEvidence, ...(currentDataset.evidenceSources || [])],
      },
    }));

    addAuditLog(
      'INTELLIGENCE_INGESTED',
      fileData.fileName,
      'MODIFIED',
      `Imported ${fileData.fileName}. Extracted ${newEntitiesCount} new entities, ${newLinksCount} new links.`
    );

    return {
      entitiesCount: newEntitiesCount,
      relationshipsCount: newLinksCount,
      summary,
    };
  };

  // Confirm Entity Resolution & Merge Nodes
  const confirmEntityResolution = (candidateId: string) => {
    const candidate = resolutionCandidates.find(c => c.id === candidateId);
    if (!candidate) return;

    const currentDataset = caseDataMap[activeCaseNumber] || caseDatasets['NDPS-118/2024'];
    const entityA = (currentDataset.entities || []).find(e => e.id === candidate.entityAId);
    const entityB = (currentDataset.entities || []).find(e => e.id === candidate.entityBId);

    if (!entityA || !entityB) return;

    const { mergedEntity, updatedRelationships, removedEntityId } = mergeEntities(
      entityA,
      entityB,
      currentDataset.relationships || []
    );

    const remainingEntities = (currentDataset.entities || [])
      .filter(e => e.id !== removedEntityId)
      .map(e => (e.id === mergedEntity.id ? mergedEntity : e));

    setCaseDataMap(prev => ({
      ...prev,
      [activeCaseNumber]: {
        ...currentDataset,
        entities: remainingEntities,
        relationships: updatedRelationships,
      },
    }));

    if (selectedEntityId === removedEntityId) {
      setSelectedEntityId(mergedEntity.id);
    }

    addAuditLog(
      'ENTITY_MERGED_AND_RESOLVED',
      `${entityB.name} (${entityB.id}) -> ${entityA.name} (${entityA.id})`,
      'MODIFIED',
      `Confidence: ${candidate.confidence}%. Reasons: ${candidate.matchReasons.join(', ')}`
    );
  };

  // Reject Entity Resolution
  const rejectEntityResolution = (candidateId: string) => {
    const candidate = resolutionCandidates.find(c => c.id === candidateId);
    if (!candidate) return;

    addAuditLog(
      'ENTITY_RESOLUTION_REJECTED',
      `${candidate.recordA.name} ≉ ${candidate.recordB.name}`,
      'AUTHORIZED',
      'Investigator marked candidate entities as distinct separate entities.'
    );
  };

  const updateTaskStatus = (taskId: string, status: CaseTask['status']) => {
    const currentDataset = caseDataMap[activeCaseNumber] || caseDatasets['NDPS-118/2024'];
    const updatedTasks = (currentDataset.tasks || []).map(t => (t.id === taskId ? { ...t, status } : t));

    setCaseDataMap(prev => ({
      ...prev,
      [activeCaseNumber]: {
        ...currentDataset,
        tasks: updatedTasks,
      },
    }));

    addAuditLog('TASK_STATUS_UPDATED', taskId, 'MODIFIED', `Task updated to ${status}`);
  };

  const addNewTask = (task: Omit<CaseTask, 'id' | 'createdDate'>) => {
    const currentDataset = caseDataMap[activeCaseNumber] || caseDatasets['NDPS-118/2024'];
    const newTask: CaseTask = {
      ...task,
      id: `task-${Date.now()}`,
      createdDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    };

    setCaseDataMap(prev => ({
      ...prev,
      [activeCaseNumber]: {
        ...currentDataset,
        tasks: [newTask, ...(currentDataset.tasks || [])],
      },
    }));

    addAuditLog('NEW_TASK_CREATED', newTask.title, 'MODIFIED', `Assigned to ${newTask.assignedOfficer}`);
  };

  const addTask = (newTask: CaseTask) => {
    const currentDataset = caseDataMap[activeCaseNumber] || caseDatasets['NDPS-118/2024'];
    setCaseDataMap(prev => ({
      ...prev,
      [activeCaseNumber]: {
        ...currentDataset,
        tasks: [newTask, ...(currentDataset.tasks || [])],
      },
    }));
    addAuditLog('NEW_TASK_CREATED', newTask.title, 'MODIFIED', `Assigned to ${newTask.assignedOfficer}`);
  };

  const toggleLinkCase = (caseId: string) => {
    const currentDataset = caseDataMap[activeCaseNumber] || caseDatasets['NDPS-118/2024'];
    const updatedRelated = (currentDataset.relatedCases || []).map(rc => 
      rc.id === caseId ? { ...rc, linked: !rc.linked } : rc
    );

    setCaseDataMap(prev => ({
      ...prev,
      [activeCaseNumber]: {
        ...currentDataset,
        relatedCases: updatedRelated,
      },
    }));

    addAuditLog('CASE_LINK_TOGGLED', caseId, 'MODIFIED', 'Updated inter-case relationship association');
  };

  const updateRoadmapStepStatus = (stepId: string, status: RoadmapStep['status']) => {
    const currentDataset = caseDataMap[activeCaseNumber] || caseDatasets['NDPS-118/2024'];
    const updatedRoadmap = (currentDataset.roadmapSteps || []).map(s => 
      s.stepId === stepId ? { ...s, status } : s
    );

    setCaseDataMap(prev => ({
      ...prev,
      [activeCaseNumber]: {
        ...currentDataset,
        roadmapSteps: updatedRoadmap,
      },
    }));

    addAuditLog('ROADMAP_STEP_UPDATED', stepId, 'MODIFIED', `Investigative step updated to ${status}`);
  };

  const resetToDefaultData = () => {
    const baseline = JSON.parse(JSON.stringify(caseDatasets));
    setCaseDataMap(baseline);
    localStorage.setItem('chakra_case_datasets_v3', JSON.stringify(baseline));
    localStorage.removeItem('chakra_case_datasets_v2');
    setSelectedEntityId(null);
    setHighlightedPath(null);
    setNetworkReport(null);
    addAuditLog('DATABASE_RESET', activeCaseNumber, 'MODIFIED', 'Reset intelligence link database to verified baseline state.');
  };

  // Dynamic Case Team Officers per active case
  const caseOfficers = useMemo(() => {
    return caseTeamByCase[activeCaseNumber] || caseTeamByCase['NDPS-118/2024'] || [];
  }, [activeCaseNumber]);

  return (
    <IntelligenceContext.Provider
      value={{
        activeCaseNumber,
        setActiveCaseNumber,
        activeCase,
        allCases: availableCases,
        caseDataMap,
        entities: enrichedEntities,
        relationships: rawRelationships,
        alerts: currentCaseRaw.alerts || [],
        evidenceSources: currentCaseRaw.evidenceSources || [],
        tasks: currentCaseRaw.tasks || [],
        relatedCases: currentCaseRaw.relatedCases || [],
        roadmapSteps: currentCaseRaw.roadmapSteps || [],
        caseOfficers,
        reports,
        auditLogs,
        resolutionCandidates,
        selectedEntityId,
        setSelectedEntityId,
        highlightedPath,
        setHighlightedPath,
        networkReport,
        isAnalyzingNetwork,
        isSwitchingCase,
        switchProgressText,
        aiBackendEnabled,
        addAuditLog,
        findPathBetween,
        runAiNetworkAnalysis,
        ingestIntelligence,
        confirmEntityResolution,
        rejectEntityResolution,
        resetToDefaultData,
        updateTaskStatus,
        addNewTask,
        addTask,
        toggleLinkCase,
        updateRoadmapStepStatus,
        addReport,
        deleteReport,
      }}
    >
      {children}
    </IntelligenceContext.Provider>
  );
};

export function useIntelligence(): IntelligenceContextType {
  const ctx = useContext(IntelligenceContext);
  if (!ctx) {
    throw new Error('useIntelligence must be used within an IntelligenceProvider');
  }
  return ctx;
}

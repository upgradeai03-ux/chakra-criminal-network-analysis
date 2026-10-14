export type EntityType = 'PERSON' | 'PHONE' | 'VEHICLE' | 'LOCATION' | 'ORGANIZATION' | 'EVENT';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface DataProvenance {
  sourceFile: string;
  sourceRecord?: string;
  importedAt: string;
  verified?: boolean;
}

export interface PriorityFactor {
  factor: string;
  points: number;
  description: string;
}

export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  riskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  confidence: number; // 0 - 100%
  connectionsCount: number;
  priorCases?: string[];
  aliases?: string[];
  priorityReasons?: PriorityFactor[];
  provenance?: DataProvenance[];
  details: {
    age?: number;
    gender?: string;
    phone?: string;
    vehicleNumber?: string;
    address?: string;
    companyType?: string;
    registrationDate?: string;
    balance?: string;
    notes?: string;
    email?: string;
    accountNumber?: string;
  };
  x?: number;
  y?: number;
  cluster?: string;
  isBridge?: boolean;
}

export type RelationshipType = 
  | 'CALLS'
  | 'OWNS'
  | 'VISITED'
  | 'WORKS_FOR'
  | 'FAMILY'
  | 'TRANSFERRED_FUNDS'
  | 'ASSOCIATED_WITH'
  | 'LOCATED_AT'
  | 'ATTENDED'
  | 'CONNECTED_TO';

export interface Relationship {
  id: string;
  sourceId: string;
  targetId: string;
  type: RelationshipType;
  weight: number; // e.g. 42 calls, 42L transfer
  sourceEvidence: string; // e.g. "CDR Analysis #4471"
  confidence: number;
  dateAdded?: string;
  provenance?: DataProvenance;
}

export interface AIAlert {
  id: string;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category: 'COMMUNICATION' | 'LOCATION' | 'FINANCIAL' | 'NETWORK';
  entityIds: string[];
  timestamp: string;
  status: 'NEW' | 'INVESTIGATING' | 'RESOLVED';
}

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'COMMUNICATION' | 'MOVEMENT' | 'FINANCIAL' | 'MEETING' | 'EVENT';
  entityId: string;
  entityName: string;
  confidence: number;
  sourceFile?: string;
}

export interface EvidenceSource {
  id: string;
  title: string;
  type: 'CDR_REPORT' | 'RTO_REGISTRY' | 'BANK_TRANSACTION' | 'FIR' | 'CRIMINAL_HISTORY' | 'INTELLIGENCE_REPORT';
  referenceId: string;
  timestamp: string;
  confidence: number;
  verified: boolean;
  summary: string;
}

export interface MatchFactor {
  attribute: string;
  similarity: number; // 0 - 100%
  weightPoints: number;
  explanation: string;
}

export interface EntityResolutionCandidate {
  id: string;
  entityAId: string;
  entityBId: string;
  recordA: { id: string; name: string; type: EntityType; detail: string; source: string };
  recordB: { id: string; name: string; type: EntityType; detail: string; source: string };
  confidence: number;
  matchReasons: string[];
  matchFactors?: MatchFactor[];
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED';
}

export interface ShortestPathStep {
  entity: Entity;
  relationshipToNext?: {
    type: RelationshipType;
    evidence: string;
    confidence: number;
  };
}

export interface ShortestPathResult {
  found: boolean;
  hops: number;
  path: ShortestPathStep[];
  nodeIds: string[];
  edgeIds: string[];
  explanation: string;
}

export interface NetworkCluster {
  clusterId: string;
  name: string;
  entityCount: number;
  primaryType: string;
  entities: string[];
}

export interface GraphValidationResult {
  isValid: boolean;
  entityCount: number;
  relationshipCount: number;
  connectedComponents: number;
  errors: string[];
  warnings: string[];
  details: {
    invalidEntityReferences: Array<{ relationshipId: string; missingId: string; role: 'source' | 'target' }>;
    duplicateEntityIds: string[];
    duplicateRelationshipIds: string[];
    selfLoops: string[];
    isolatedEntityCount: number;
  };
}

export interface NetworkAnalysisReport {
  executiveSummary: string;
  keyEntities: Array<{
    name: string;
    roleDescription: string;
    analyticalSignificance: string;
    priorityLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  }>;
  importantRelationships: Array<{
    connection: string;
    significance: string;
  }>;
  networkStructure: {
    topologyType: string;
    bridgeEntities: string[];
    clusterBreakdown: string;
    vulnerabilities?: string;
  };
  potentialAnomalies: string[];
  recommendedInvestigativeQuestions: string[];
  generatedAt: string;
}

export type CaseCategory = 
  | 'NARCOTICS'
  | 'FRAUD'
  | 'CYBER_CRIME'
  | 'PROPERTY_CRIME'
  | 'VEHICLE_CRIME'
  | 'HOMICIDE'
  | 'ROBBERY'
  | 'KIDNAPPING'
  | 'ORGANIZED_CRIME'
  | 'OTHER';

export interface InvestigationCase {
  caseNumber: string;
  title: string;
  category: CaseCategory;
  status: 'ACTIVE' | 'UNDER_REVIEW' | 'CLOSED';
  investigator: string;
  createdDate: string;
  lastUpdated: string;
  description: string;
  entitiesCount: number;
  relationshipsCount: number;
  highRiskCount: number;
  openAlertsCount: number;
}

export interface CaseTask {
  id: string;
  title: string;
  description: string;
  assignedOfficer: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate: string;
  status: 'TODO' | 'IN_PROGRESS' | 'BLOCKED' | 'COMPLETED';
  createdDate: string;
  evidenceRef?: string;
  notes?: string;
}

export interface OfficerDeliverable {
  id: string;
  title: string;
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING' | 'BLOCKED';
  dueDate: string;
  progress: number;
  notes?: string;
}

export interface CaseOfficer {
  id: string;
  name: string;
  role: string;
  status: 'AVAILABLE' | 'IN_FIELD' | 'IN_COURT' | 'OFF_DUTY';
  assignedTasks?: number;
  completedTasks?: number;
  assignedTasksCount?: number;
  completedTasksCount?: number;
  lastActive?: string;
  lastActivity?: string;
  contribution: string;
  deliverables?: OfficerDeliverable[];
}

export interface RelatedCase {
  id: string;
  caseNumber: string;
  title: string;
  category: CaseCategory;
  sharedEntities: number;
  sharedLocations: number;
  sharedRelationships: number;
  confidence: number;
  linked: boolean;
  relationReason?: string;
  status?: 'ACTIVE' | 'UNDER_REVIEW' | 'CLOSED';
  priority?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  year?: string;
  description?: string;
}

export interface InvestigationGroup {
  groupId: string;
  groupName: string;
  relatedCasesCount: number;
  stats: {
    people: number;
    vehicles: number;
    locations: number;
    organizations: number;
  };
}

export interface RoadmapStep {
  stepId: string;
  title: string;
  description: string;
  category: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';
  targetModule: 'network' | 'heatmap' | 'evidence' | 'entities' | 'alerts' | 'analytics' | 'reports';
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  result: 'AUTHORIZED' | 'RESTRICTED' | 'MODIFIED';
  details?: string;
}

export interface GeneratedReport {
  id: string;
  caseNumber: string;
  caseTitle: string;
  category: string;
  generatedBy: string;
  generatedAt: string;
  status: 'GENERATED' | 'ARCHIVED';
  summary: string;
  entitiesSummary: {
    people: number;
    organizations: number;
    vehicles: number;
    locations: number;
    other: number;
  };
  networkStats: {
    totalEntities: number;
    totalRelationships: number;
    highRiskCount: number;
  };
  tasksSummary: {
    completed: number;
    pending: number;
    overdue: number;
  };
  roadmapProgress: {
    completed: number;
    total: number;
  };
  alertsCount: number;
  evidenceCount: number;
  aiAnalysisSummary?: string;
}

export type UserRole = 'ADMIN' | 'LEAD_INVESTIGATOR' | 'INVESTIGATOR' | 'ANALYST' | 'VIEWER';

export interface UserProfile {
  id: string;
  officerId: string;
  name: string;
  badgeNumber: string;
  role: UserRole;
  department: string;
  status: 'ACTIVE' | 'OFF_DUTY';
  permissions?: string[];
  avatar?: string;
}

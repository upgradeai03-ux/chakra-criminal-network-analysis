import { 
  Entity, 
  Relationship, 
  AIAlert, 
  TimelineEvent, 
  EvidenceSource, 
  EntityResolutionCandidate, 
  InvestigationCase,
  CaseTask,
  CaseOfficer,
  RelatedCase,
  InvestigationGroup,
  RoadmapStep,
  AuditLogEntry
} from '../types';

export const availableCases: InvestigationCase[] = [
  {
    caseNumber: 'NDPS-118/2024',
    title: 'Operation Syndicate Link - Narcotic & Financial Nexus',
    category: 'NARCOTICS',
    status: 'ACTIVE',
    investigator: 'Cmdr. V. R. Sharma (IO-4091)',
    createdDate: '2024-08-12',
    lastUpdated: '2024-08-22',
    description: 'Inter-state contraband smuggling and hawala money laundering syndicate operating across Mumbai, Pune, and Thane.',
    entitiesCount: 8,
    relationshipsCount: 8,
    highRiskCount: 4,
    openAlertsCount: 5,
  },
  {
    caseNumber: 'FRAUD-204/2024',
    title: 'Hawala Shell Conduit & Multi-Bank Fraud Ring',
    category: 'FRAUD',
    status: 'ACTIVE',
    investigator: 'Priya Nair (IO-3021)',
    createdDate: '2024-07-15',
    lastUpdated: '2024-08-22',
    description: 'Multi-bank financial layering scheme utilizing dormant corporate accounts and fictitious trade invoices to siphon capital overseas from Mumbai.',
    entitiesCount: 9,
    relationshipsCount: 11,
    highRiskCount: 3,
    openAlertsCount: 4,
  },
  {
    caseNumber: 'CYBER-032/2025',
    title: 'Dark Web Extortion & Crypto Laundering Network',
    category: 'CYBER_CRIME',
    status: 'ACTIVE',
    investigator: 'Vikram Joshi (IO-5092)',
    createdDate: '2025-01-10',
    lastUpdated: '2024-08-21',
    description: 'Ransomware deployment against financial institutions in Bengaluru followed by decentralized mixer laundering across proxy digital nodes.',
    entitiesCount: 9,
    relationshipsCount: 12,
    highRiskCount: 3,
    openAlertsCount: 3,
  },
  {
    caseNumber: 'VEH-087/2025',
    title: 'Inter-State Vehicle Cloning & Highway Transit Syndicate',
    category: 'VEHICLE_CRIME',
    status: 'UNDER_REVIEW',
    investigator: 'R. K. Deshmukh (IO-2114)',
    createdDate: '2025-02-04',
    lastUpdated: '2024-08-20',
    description: 'Highway vehicle hijacking, chassis number tampering, and forged registration document racket operating along Delhi-Jaipur highway corridor.',
    entitiesCount: 8,
    relationshipsCount: 10,
    highRiskCount: 2,
    openAlertsCount: 3,
  },
  {
    caseNumber: 'PROPERTY-119/2023',
    title: 'Land Grabbing & Forged Title Deed Syndicate',
    category: 'PROPERTY_CRIME',
    status: 'ACTIVE',
    investigator: 'Cmdr. V. R. Sharma (IO-4091)',
    createdDate: '2023-09-15',
    lastUpdated: '2024-08-18',
    description: 'Systematic fabrication of archaic land revenue records and illegal encroachment on commercial properties in Pune.',
    entitiesCount: 8,
    relationshipsCount: 9,
    highRiskCount: 2,
    openAlertsCount: 2,
  },
  {
    caseNumber: 'NARC-061/2024',
    title: 'Hyderabad Pharmaceutical Diversion & Courier Ring',
    category: 'NARCOTICS',
    status: 'CLOSED',
    investigator: 'Priya Nair (IO-3021)',
    createdDate: '2024-03-20',
    lastUpdated: '2024-07-30',
    description: 'Clandestine diversion of controlled psychotropic substances from licensed manufacturing facilities in Hyderabad via express courier hubs.',
    entitiesCount: 8,
    relationshipsCount: 10,
    highRiskCount: 3,
    openAlertsCount: 1,
  }
];

export const activeCase: InvestigationCase = availableCases[0];

// Datasets mapped per case
export const caseDatasets: Record<string, {
  entities: Entity[];
  relationships: Relationship[];
  alerts: AIAlert[];
  evidenceSources: EvidenceSource[];
  tasks: CaseTask[];
  relatedCases: RelatedCase[];
  roadmapSteps: RoadmapStep[];
}> = {
  'NDPS-118/2024': {
    entities: [
      {
        id: 'ent-1',
        name: 'Arjun Verma',
        type: 'PERSON',
        riskScore: 92,
        riskLevel: 'CRITICAL',
        confidence: 96,
        connectionsCount: 4,
        priorCases: ['NDPS 22/2019', 'IPC 384/2021'],
        details: { age: 41, gender: 'Male', phone: '+91 98211-44122', vehicleNumber: 'MH12 AB 1234', address: 'Flat 402, Shivneri Heights, Andheri East, Mumbai', notes: 'Key coordinator managing logistics and distribution.' },
        x: 450, y: 300, cluster: 'Cluster A'
      },
      {
        id: 'ent-2',
        name: '+91 98211-44122',
        type: 'PHONE',
        riskScore: 88,
        riskLevel: 'HIGH',
        confidence: 99,
        connectionsCount: 2,
        details: { companyType: 'Airtel Prepaid', registrationDate: '14-Jan-2022', address: 'Registered using fake ID (Andheri East)' },
        x: 280, y: 190, cluster: 'Cluster A'
      },
      {
        id: 'ent-3',
        name: 'MH12 AB 1234',
        type: 'VEHICLE',
        riskScore: 84,
        riskLevel: 'HIGH',
        confidence: 98,
        connectionsCount: 2,
        details: { vehicleNumber: 'MH12 AB 1234', companyType: 'White Toyota Fortuner', address: 'Registered under Shellco Logistics' },
        x: 620, y: 180, cluster: 'Cluster A'
      },
      {
        id: 'ent-4',
        name: 'Rohit Sinha',
        type: 'PERSON',
        riskScore: 78,
        riskLevel: 'HIGH',
        confidence: 91,
        connectionsCount: 3,
        priorCases: ['EXCISE 04/2020'],
        details: { age: 36, gender: 'Male', phone: '+91 99302-88110', address: 'B-12, Palm Grove Apt, Bandra West, Mumbai', notes: 'Financial handler and conduit for hawala transfers.' },
        x: 200, y: 420, cluster: 'Cluster B'
      },
      {
        id: 'ent-5',
        name: 'Shellco Logistics Pvt Ltd',
        type: 'ORGANIZATION',
        riskScore: 81,
        riskLevel: 'HIGH',
        confidence: 94,
        connectionsCount: 3,
        details: { companyType: 'Private Limited', registrationDate: '10-Nov-2021', address: 'Unit 304, Techno Plaza, MIDC, Andheri East', balance: '₹ 42,50,000' },
        x: 700, y: 450, cluster: 'Cluster A'
      },
      {
        id: 'ent-6',
        name: 'Andheri East Warehouse',
        type: 'LOCATION',
        riskScore: 85,
        riskLevel: 'HIGH',
        confidence: 95,
        connectionsCount: 2,
        details: { address: 'Plot 18, MIDC Industrial Area, Andheri East, Mumbai' },
        x: 500, y: 540, cluster: 'Cluster A'
      },
      {
        id: 'ent-7',
        name: 'Meena Kulkarni',
        type: 'PERSON',
        riskScore: 55,
        riskLevel: 'MEDIUM',
        confidence: 88,
        connectionsCount: 2,
        details: { age: 29, gender: 'Female', phone: '+91 97654-11223', address: 'Flat 12, Siddhivinayak Society, Thane West', notes: 'Assistant accountant.' },
        x: 310, y: 600, cluster: 'Cluster B'
      },
      {
        id: 'ent-8',
        name: '+91 99302-88110',
        type: 'PHONE',
        riskScore: 72,
        riskLevel: 'HIGH',
        confidence: 97,
        connectionsCount: 2,
        details: { companyType: 'Jio Postpaid', registrationDate: '02-Mar-2023', address: 'Bandra West, Mumbai' },
        x: 100, y: 300, cluster: 'Cluster B'
      }
    ],
    relationships: [
      { id: 'rel-1', sourceId: 'ent-1', targetId: 'ent-2', type: 'CALLS', weight: 42, sourceEvidence: 'CDR Analysis #092', confidence: 95 },
      { id: 'rel-2', sourceId: 'ent-1', targetId: 'ent-3', type: 'OWNS', weight: 1, sourceEvidence: 'TOLL Registry #419', confidence: 90 },
      { id: 'rel-3', sourceId: 'ent-1', targetId: 'ent-5', type: 'ASSOCIATED_WITH', weight: 3, sourceEvidence: 'MCA Registry #33', confidence: 85 },
      { id: 'rel-4', sourceId: 'ent-1', targetId: 'ent-6', type: 'VISITED', weight: 18, sourceEvidence: 'CCTV Logs #882', confidence: 88 },
      { id: 'rel-5', sourceId: 'ent-4', targetId: 'ent-8', type: 'CALLS', weight: 29, sourceEvidence: 'CDR Analysis #104', confidence: 92 },
      { id: 'rel-6', sourceId: 'ent-4', targetId: 'ent-5', type: 'TRANSFERRED_FUNDS', weight: 6, sourceEvidence: 'FIU Statement #12', confidence: 84 },
      { id: 'rel-7', sourceId: 'ent-7', targetId: 'ent-4', type: 'ASSOCIATED_WITH', weight: 4, sourceEvidence: 'Bank Stmt #99', confidence: 70 },
      { id: 'rel-8', sourceId: 'ent-6', targetId: 'ent-3', type: 'VISITED', weight: 12, sourceEvidence: 'TOLL Log #501', confidence: 80 }
    ],
    alerts: [
      { id: 'alt-1', title: 'High Nocturnal CDR Anomaly', description: 'Subject Arjun Verma exhibited repeated cell tower handshakes near warehouse.', priority: 'CRITICAL', category: 'COMMUNICATION', entityIds: ['ent-1'], timestamp: '2026-08-22 03:14:00', status: 'NEW' },
      { id: 'alt-2', title: 'Suspicious Hawala Fund Transfer', description: 'Shellco Logistics account received ₹42.5L across 6 tranches.', priority: 'HIGH', category: 'FINANCIAL', entityIds: ['ent-5'], timestamp: '2026-08-21 16:45:00', status: 'NEW' },
      { id: 'alt-3', title: 'Vehicle Plate Anomaly by ANPR', description: 'White Toyota Fortuner crossed toll plaza without FASTag.', priority: 'HIGH', category: 'LOCATION', entityIds: ['ent-3'], timestamp: '2026-08-20 22:10:00', status: 'INVESTIGATING' }
    ],
    evidenceSources: [
      { id: 'ev-1', title: 'Call Detail Records (CDR)', type: 'CDR_REPORT', referenceId: 'CDR-MH-4471', timestamp: '2026-08-20', confidence: 98, verified: true, summary: '60 days of call logs and cell site coordinates.' },
      { id: 'ev-2', title: 'FIU Bank Statements', type: 'BANK_TRANSACTION', referenceId: 'FIU-TXN-88234', timestamp: '2026-08-18', confidence: 99, verified: true, summary: 'Certified outward remittance records.' }
    ],
    tasks: [
      { id: 'tsk-1', title: 'Audit Shellco Logistics Bank Records', description: 'Verify source of ₹42.5L inward remittances.', assignedOfficer: 'Priya Nair', priority: 'HIGH', dueDate: '2026-08-28', status: 'IN_PROGRESS', createdDate: '2026-08-14' },
      { id: 'tsk-2', title: 'Surveillance on Andheri East Warehouse', description: 'Deploy 24/7 tactical drone observation.', assignedOfficer: 'Cmdr. V. R. Sharma', priority: 'URGENT', dueDate: '2026-08-25', status: 'TODO', createdDate: '2026-08-15' }
    ],
    relatedCases: [
      { 
        id: 'rc-1', 
        caseNumber: 'FRAUD-204/2024', 
        title: 'Hawala Shell Conduit & Multi-Bank Fraud Ring', 
        category: 'FRAUD', 
        sharedEntities: 4, 
        sharedLocations: 2, 
        sharedRelationships: 5, 
        confidence: 94, 
        linked: true,
        relationReason: 'Shared Shellco Logistics corporate conduits and overlapping hawala bank transactions.',
        status: 'ACTIVE',
        priority: 'CRITICAL',
        year: '2024'
      },
      { 
        id: 'rc-2', 
        caseNumber: 'NARC-061/2024', 
        title: 'Hyderabad Pharmaceutical Diversion & Courier Ring', 
        category: 'NARCOTICS', 
        sharedEntities: 3, 
        sharedLocations: 1, 
        sharedRelationships: 4, 
        confidence: 89, 
        linked: false,
        relationReason: 'Identical chemical precursor batch markings seized at Andheri warehouse.',
        status: 'CLOSED',
        priority: 'HIGH',
        year: '2024'
      },
      { 
        id: 'rc-3', 
        caseNumber: 'VEH-087/2025', 
        title: 'Inter-State Vehicle Cloning & Highway Transit Syndicate', 
        category: 'VEHICLE_CRIME', 
        sharedEntities: 2, 
        sharedLocations: 2, 
        sharedRelationships: 3, 
        confidence: 82, 
        linked: false,
        relationReason: 'White Toyota Fortuner (MH12 AB 1234) chassis registered via cloned donor sequence.',
        status: 'UNDER_REVIEW',
        priority: 'MEDIUM',
        year: '2025'
      }
    ],
    roadmapSteps: [
      { stepId: 'step-1', title: 'Establish Primary Target Profiles', description: 'Identify primary suspects and verify identity documents.', category: 'Phase 1', status: 'COMPLETED', targetModule: 'entities' },
      { stepId: 'step-2', title: 'Collect Telecommunication Intelligence', description: 'Import certified CDR logs.', category: 'Phase 1', status: 'COMPLETED', targetModule: 'evidence' },
      { stepId: 'step-3', title: 'Build Entity Relationship Link Graph', description: 'Map connections between suspects and accounts.', category: 'Phase 2', status: 'IN_PROGRESS', targetModule: 'network' }
    ]
  },
  'FRAUD-204/2024': {
    entities: [
      { id: 'f-1', name: 'Kiran Mehta', type: 'PERSON', riskScore: 94, riskLevel: 'CRITICAL', confidence: 98, connectionsCount: 5, details: { age: 48, phone: '+91 98190-22331', address: 'Nariman Point, Mumbai', notes: 'Mastermind behind shell trade invoicing.' }, x: 400, y: 300, cluster: 'FinCluster' },
      { id: 'f-2', name: 'Apex Global Impex', type: 'ORGANIZATION', riskScore: 90, riskLevel: 'CRITICAL', confidence: 95, connectionsCount: 4, details: { companyType: 'Shell Export Firm', balance: '₹ 14.2 Crores' }, x: 600, y: 250, cluster: 'FinCluster' },
      { id: 'f-3', name: '+91 98190-22331', type: 'PHONE', riskScore: 89, riskLevel: 'HIGH', confidence: 99, connectionsCount: 2, details: { companyType: 'Vodafone Idea Postpaid' }, x: 250, y: 200, cluster: 'FinCluster' },
      { id: 'f-4', name: 'HDFC BK AC #9921', type: 'ACCOUNT' as any, riskScore: 92, riskLevel: 'CRITICAL', confidence: 99, connectionsCount: 4, details: { balance: '₹ 3.8 Cr Outflow' }, x: 500, y: 450, cluster: 'FinCluster' },
      { id: 'f-5', name: 'Sanjay Shah', type: 'PERSON', riskScore: 75, riskLevel: 'HIGH', confidence: 90, connectionsCount: 3, details: { age: 42, address: 'Worli Sea Face, Mumbai' }, x: 300, y: 550, cluster: 'FinCluster' },
      { id: 'f-6', name: 'Zenith Bullion Traders', type: 'ORGANIZATION', riskScore: 82, riskLevel: 'HIGH', confidence: 92, connectionsCount: 3, details: { balance: '₹ 8.5 Cr Turnover' }, x: 750, y: 400, cluster: 'FinCluster' },
      { id: 'f-7', name: 'ICICI BK AC #4419', type: 'ACCOUNT' as any, riskScore: 86, riskLevel: 'HIGH', confidence: 97, connectionsCount: 3, details: { balance: '₹ 5.1 Cr' }, x: 650, y: 600, cluster: 'FinCluster' },
      { id: 'f-8', name: 'BKC Corporate Office', type: 'LOCATION', riskScore: 70, riskLevel: 'MEDIUM', confidence: 91, connectionsCount: 2, details: { address: 'Bandra Kurla Complex, Mumbai' }, x: 450, y: 150, cluster: 'FinCluster' },
      { id: 'f-9', name: 'Deepak Patel', type: 'PERSON', riskScore: 68, riskLevel: 'MEDIUM', confidence: 85, connectionsCount: 2, details: { age: 39, phone: '+91 99201-55664' }, x: 200, y: 400, cluster: 'FinCluster' }
    ],
    relationships: [
      { id: 'fr-1', sourceId: 'f-1', targetId: 'f-2', type: 'OWNS', weight: 1, sourceEvidence: 'MCA File #901', confidence: 99 },
      { id: 'fr-2', sourceId: 'f-1', targetId: 'f-3', type: 'CALLS', weight: 88, sourceEvidence: 'CDR #311', confidence: 98 },
      { id: 'fr-3', sourceId: 'f-2', targetId: 'f-4', type: 'TRANSFERRED_FUNDS', weight: 45, sourceEvidence: 'FIU Stmt #02', confidence: 95 },
      { id: 'fr-4', sourceId: 'f-4', targetId: 'f-6', type: 'TRANSFERRED_FUNDS', weight: 32, sourceEvidence: 'Bank Wire #88', confidence: 94 },
      { id: 'fr-5', sourceId: 'f-5', targetId: 'f-6', type: 'ASSOCIATED_WITH', weight: 12, sourceEvidence: 'Registry #14', confidence: 88 },
      { id: 'fr-6', sourceId: 'f-5', targetId: 'f-7', type: 'TRANSFERRED_FUNDS', weight: 18, sourceEvidence: 'Bank Stmt #09', confidence: 90 },
      { id: 'fr-7', sourceId: 'f-1', targetId: 'f-8', type: 'VISITED', weight: 24, sourceEvidence: 'CCTV #12', confidence: 85 },
      { id: 'fr-8', sourceId: 'f-9', targetId: 'f-4', type: 'TRANSFERRED_FUNDS', weight: 8, sourceEvidence: 'FIU Stmt #04', confidence: 82 },
      { id: 'fr-9', sourceId: 'f-9', targetId: 'f-1', type: 'CALLS', weight: 19, sourceEvidence: 'CDR #44', confidence: 89 },
      { id: 'fr-10', sourceId: 'f-6', targetId: 'f-7', type: 'TRANSFERRED_FUNDS', weight: 15, sourceEvidence: 'Bank Wire #99', confidence: 91 },
      { id: 'fr-11', sourceId: 'f-2', targetId: 'f-8', type: 'LOCATED_AT', weight: 1, sourceEvidence: 'Lease Agreement', confidence: 96 }
    ],
    alerts: [
      { id: 'falt-1', title: 'Massive Outward Remittance Surge', description: 'Apex Global Impex wired ₹14.2 Cr to overseas shell entities in 72 hours.', priority: 'CRITICAL', category: 'FINANCIAL', entityIds: ['f-2', 'f-4'], timestamp: '2026-08-22 14:10:00', status: 'NEW' },
      { id: 'falt-2', title: 'Dormant Account Sudden Activation', description: 'HDFC AC #9921 dormant for 14 months received 45 concurrent tranches.', priority: 'HIGH', category: 'FINANCIAL', entityIds: ['f-4'], timestamp: '2026-08-21 09:30:00', status: 'NEW' }
    ],
    evidenceSources: [
      { id: 'fev-1', title: 'Reserve Bank of India Forex Audit', type: 'BANK_TRANSACTION', referenceId: 'RBI-FX-9021', timestamp: '2026-08-20', confidence: 99, verified: true, summary: 'Unauthorized outward forex remittances via falsified bill of entry documents.' }
    ],
    tasks: [
      { id: 'ftsk-1', title: 'Freeze Apex Global Bank Accounts', description: 'Issue statutory freezing order under PMLA Section 17.', assignedOfficer: 'Priya Nair', priority: 'URGENT', dueDate: '2026-08-26', status: 'IN_PROGRESS', createdDate: '2026-08-18' }
    ],
    relatedCases: [
      { 
        id: 'frc-1', 
        caseNumber: 'NDPS-118/2024', 
        title: 'Operation Syndicate Link - Narcotic & Financial Nexus', 
        category: 'NARCOTICS', 
        sharedEntities: 4, 
        sharedLocations: 2, 
        sharedRelationships: 5, 
        confidence: 94, 
        linked: true,
        relationReason: 'Shared offshore shell accounts (HDFC AC #9921) receiving contraband proceeds.',
        status: 'ACTIVE',
        priority: 'CRITICAL',
        year: '2024'
      },
      { 
        id: 'frc-2', 
        caseNumber: 'CYBER-032/2025', 
        title: 'Dark Web Extortion & Crypto Laundering Network', 
        category: 'CYBER_CRIME', 
        sharedEntities: 3, 
        sharedLocations: 1, 
        sharedRelationships: 4, 
        confidence: 91, 
        linked: false,
        relationReason: 'Direct crypto-to-fiat conversion wires routed into Apex Global Impex accounts.',
        status: 'ACTIVE',
        priority: 'HIGH',
        year: '2025'
      },
      { 
        id: 'frc-3', 
        caseNumber: 'PROPERTY-119/2023', 
        title: 'Land Grabbing & Forged Title Deed Syndicate', 
        category: 'PROPERTY_CRIME', 
        sharedEntities: 2, 
        sharedLocations: 1, 
        sharedRelationships: 2, 
        confidence: 79, 
        linked: false,
        relationReason: 'Sahyadri Shelters received laundered funds from Zenith Bullion escrow.',
        status: 'ACTIVE',
        priority: 'MEDIUM',
        year: '2023'
      }
    ],
    roadmapSteps: [
      { stepId: 'fstep-1', title: 'Trace Beneficial Ownership', description: 'Unmask directors behind Apex Global.', category: 'Phase 1', status: 'COMPLETED', targetModule: 'entities' }
    ]
  },
  'CYBER-032/2025': {
    entities: [
      { id: 'c-1', name: 'Alexandre Mercer (Alias "NullByte")', type: 'PERSON', riskScore: 98, riskLevel: 'CRITICAL', confidence: 99, connectionsCount: 5, details: { age: 28, phone: '+91 99001-11223', address: 'Koramangala 4th Block, Bengaluru', notes: 'Ransomware deployment lead.' }, x: 400, y: 300, cluster: 'CyberCluster' },
      { id: 'c-2', name: '185.220.101.5 (Tor Exit Node)', type: 'LOCATION', riskScore: 95, riskLevel: 'CRITICAL', confidence: 99, connectionsCount: 4, details: { address: 'Encrypted Relay Node (Frankfurt IP)' }, x: 600, y: 200, cluster: 'CyberCluster' },
      { id: 'c-3', name: 'Wallet: bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', type: 'ACCOUNT' as any, riskScore: 96, riskLevel: 'CRITICAL', confidence: 99, connectionsCount: 4, details: { balance: '142.5 BTC (Mixer Laundered)' }, x: 500, y: 450, cluster: 'CyberCluster' },
      { id: 'c-4', name: 'TechVault Solutions Server', type: 'ORGANIZATION', riskScore: 88, riskLevel: 'HIGH', confidence: 95, connectionsCount: 3, details: { companyType: 'Cloud Hosting Provider', address: 'Electronic City, Bengaluru' }, x: 250, y: 400, cluster: 'CyberCluster' },
      { id: 'c-5', name: '+91 99001-11223', type: 'PHONE', riskScore: 91, riskLevel: 'CRITICAL', confidence: 98, connectionsCount: 3, details: { companyType: 'Airtel eSIM' }, x: 300, y: 180, cluster: 'CyberCluster' },
      { id: 'c-6', name: 'Rohan Deshmukh', type: 'PERSON', riskScore: 80, riskLevel: 'HIGH', confidence: 92, connectionsCount: 3, details: { age: 31, address: 'Indiranagar, Bengaluru' }, x: 700, y: 400, cluster: 'CyberCluster' },
      { id: 'c-7', name: 'DELL-POWEREDGE-99', type: 'VEHICLE' as any, riskScore: 82, riskLevel: 'HIGH', confidence: 94, connectionsCount: 2, details: { vehicleNumber: 'Seized Rack Server' }, x: 550, y: 600, cluster: 'CyberCluster' },
      { id: 'c-8', name: 'Cyberabad IP Gateway', type: 'LOCATION', riskScore: 78, riskLevel: 'HIGH', confidence: 90, connectionsCount: 2, details: { address: 'Whitefield, Bengaluru' }, x: 200, y: 280, cluster: 'CyberCluster' },
      { id: 'c-9', name: 'Wallet: 0x71C...392A', type: 'ACCOUNT' as any, riskScore: 85, riskLevel: 'HIGH', confidence: 96, connectionsCount: 3, details: { balance: '450 ETH' }, x: 750, y: 550, cluster: 'CyberCluster' }
    ],
    relationships: [
      { id: 'cr-1', sourceId: 'c-1', targetId: 'c-5', type: 'CALLS', weight: 54, sourceEvidence: 'CDR #88', confidence: 99 },
      { id: 'cr-2', sourceId: 'c-1', targetId: 'c-2', type: 'ASSOCIATED_WITH', weight: 120, sourceEvidence: 'Packet Capture #01', confidence: 98 },
      { id: 'cr-3', sourceId: 'c-2', targetId: 'c-3', type: 'TRANSFERRED_FUNDS', weight: 14, sourceEvidence: 'Blockchain Trace #99', confidence: 99 },
      { id: 'cr-4', sourceId: 'c-1', targetId: 'c-4', type: 'VISITED', weight: 19, sourceEvidence: 'Access Log #44', confidence: 92 },
      { id: 'cr-5', sourceId: 'c-6', targetId: 'c-3', type: 'TRANSFERRED_FUNDS', weight: 8, sourceEvidence: 'Crypto Tx #12', confidence: 90 },
      { id: 'cr-6', sourceId: 'c-6', targetId: 'c-1', type: 'CALLS', weight: 31, sourceEvidence: 'Signal Log #05', confidence: 94 },
      { id: 'cr-7', sourceId: 'c-7', targetId: 'c-4', type: 'LOCATED_AT', weight: 1, sourceEvidence: 'Seizure Memo #02', confidence: 99 },
      { id: 'cr-8', sourceId: 'c-8', targetId: 'c-1', type: 'VISITED', weight: 22, sourceEvidence: 'ISP Log #71', confidence: 91 },
      { id: 'cr-9', sourceId: 'c-3', targetId: 'c-9', type: 'TRANSFERRED_FUNDS', weight: 25, sourceEvidence: 'Chainalysis #11', confidence: 97 },
      { id: 'cr-10', sourceId: 'c-6', targetId: 'c-9', type: 'OWNS', weight: 1, sourceEvidence: 'Exchange KYC', confidence: 95 },
      { id: 'cr-11', sourceId: 'c-4', targetId: 'c-7', type: 'ASSOCIATED_WITH', weight: 2, sourceEvidence: 'Audit #04', confidence: 89 },
      { id: 'cr-12', sourceId: 'c-5', targetId: 'c-8', type: 'VISITED', weight: 10, sourceEvidence: 'Tower Dump', confidence: 88 }
    ],
    alerts: [
      { id: 'calt-1', title: 'Crypto Mixer Tumbler Execution', description: '142.5 BTC passed through automated Tornado Cash style smart contract.', priority: 'CRITICAL', category: 'FINANCIAL', entityIds: ['c-3'], timestamp: '2026-08-22 04:12:00', status: 'NEW' }
    ],
    evidenceSources: [
      { id: 'cev-1', title: 'Chainalysis Forensic Blockchain Report', type: 'CDR_REPORT', referenceId: 'CHAIN-BL-442', timestamp: '2026-08-21', confidence: 99, verified: true, summary: 'Multi-hop cryptocurrency transaction tracing across 14 mixing nodes.' }
    ],
    tasks: [
      { id: 'ctsk-1', title: 'De-anonymize Tor Relay Log', description: 'Coordinate with international cyber partners for ISP exit logs.', assignedOfficer: 'Vikram Joshi', priority: 'URGENT', dueDate: '2026-08-27', status: 'IN_PROGRESS', createdDate: '2026-08-19' }
    ],
    relatedCases: [
      { 
        id: 'crc-1', 
        caseNumber: 'FRAUD-204/2024', 
        title: 'Hawala Shell Conduit & Multi-Bank Fraud Ring', 
        category: 'FRAUD', 
        sharedEntities: 3, 
        sharedLocations: 1, 
        sharedRelationships: 4, 
        confidence: 91, 
        linked: true,
        relationReason: 'Mixer-laundered Bitcoin tranches liquidated through Apex Global Impex banking channels.',
        status: 'ACTIVE',
        priority: 'HIGH',
        year: '2024'
      },
      { 
        id: 'crc-2', 
        caseNumber: 'NDPS-118/2024', 
        title: 'Operation Syndicate Link - Narcotic & Financial Nexus', 
        category: 'NARCOTICS', 
        sharedEntities: 2, 
        sharedLocations: 1, 
        sharedRelationships: 3, 
        confidence: 85, 
        linked: false,
        relationReason: 'Encrypted communication handles overlap on Tor exit node relay logs.',
        status: 'ACTIVE',
        priority: 'HIGH',
        year: '2024'
      }
    ],
    roadmapSteps: [
      { stepId: 'cstep-1', title: 'Crypto Wallet Fingerprinting', description: 'Map seed phrases and exchange KYC records.', category: 'Phase 1', status: 'COMPLETED', targetModule: 'network' }
    ]
  },
  'VEH-087/2025': {
    entities: [
      { id: 'v-1', name: 'Dilbagh Singh', type: 'PERSON', riskScore: 89, riskLevel: 'HIGH', confidence: 96, connectionsCount: 4, details: { age: 45, phone: '+91 98110-33445', address: 'GT Road, Karnal, Haryana', notes: 'Vehicle re-punching expert.' }, x: 400, y: 300, cluster: 'VehCluster' },
      { id: 'v-2', name: 'HR 26 DK 9011 (Cloned)', type: 'VEHICLE', riskScore: 91, riskLevel: 'CRITICAL', confidence: 98, connectionsCount: 3, details: { vehicleNumber: 'HR 26 DK 9011', companyType: 'Mahindra Scorpio SUV' }, x: 600, y: 250, cluster: 'VehCluster' },
      { id: 'v-3', name: 'Karnal Chop Shop Garage', type: 'LOCATION', riskScore: 90, riskLevel: 'CRITICAL', confidence: 95, connectionsCount: 4, details: { address: 'Industrial Area, Karnal Bypass' }, x: 500, y: 450, cluster: 'VehCluster' },
      { id: 'v-4', name: '+91 98110-33445', type: 'PHONE', riskScore: 84, riskLevel: 'HIGH', confidence: 97, connectionsCount: 2, details: { companyType: 'Jio Prepaid' }, x: 250, y: 200, cluster: 'VehCluster' },
      { id: 'v-5', name: 'Manpreet Gill', type: 'PERSON', riskScore: 82, riskLevel: 'HIGH', confidence: 93, connectionsCount: 3, details: { age: 38, address: 'Ambala Cantt' }, x: 300, y: 550, cluster: 'VehCluster' },
      { id: 'v-6', name: 'UP 16 AB 5542 (Donor)', type: 'VEHICLE', riskScore: 78, riskLevel: 'HIGH', confidence: 94, connectionsCount: 2, details: { vehicleNumber: 'UP 16 AB 5542', companyType: 'Toyota Innova' }, x: 700, y: 400, cluster: 'VehCluster' },
      { id: 'v-7', name: 'Delhi-Jaipur Expressway', type: 'LOCATION', riskScore: 76, riskLevel: 'HIGH', confidence: 91, connectionsCount: 2, details: { address: 'KM Marker 42, Gurgaon Stretch' }, x: 450, y: 150, cluster: 'VehCluster' },
      { id: 'v-8', name: 'National RTO Database', type: 'ORGANIZATION', riskScore: 50, riskLevel: 'LOW', confidence: 99, connectionsCount: 2, details: { companyType: 'Govt Registry' }, x: 650, y: 600, cluster: 'VehCluster' }
    ],
    relationships: [
      { id: 'vr-1', sourceId: 'v-1', targetId: 'v-2', type: 'OWNS', weight: 1, sourceEvidence: 'RTO Tamper #09', confidence: 98 },
      { id: 'vr-2', sourceId: 'v-1', targetId: 'v-4', type: 'CALLS', weight: 62, sourceEvidence: 'CDR #12', confidence: 97 },
      { id: 'vr-3', sourceId: 'v-2', targetId: 'v-3', type: 'VISITED', weight: 24, sourceEvidence: 'CCTV #88', confidence: 95 },
      { id: 'vr-4', sourceId: 'v-5', targetId: 'v-3', type: 'VISITED', weight: 15, sourceEvidence: 'CCTV #91', confidence: 90 },
      { id: 'vr-5', sourceId: 'v-5', targetId: 'v-6', type: 'OWNS', weight: 1, sourceEvidence: 'Fake RC #44', confidence: 92 },
      { id: 'vr-6', sourceId: 'v-1', targetId: 'v-7', type: 'VISITED', weight: 40, sourceEvidence: 'Toll ANPR #14', confidence: 94 },
      { id: 'vr-7', sourceId: 'v-6', targetId: 'v-8', type: 'ASSOCIATED_WITH', weight: 1, sourceEvidence: 'RTO Hack', confidence: 88 },
      { id: 'vr-8', sourceId: 'v-2', targetId: 'v-7', type: 'VISITED', weight: 33, sourceEvidence: 'Toll Log #19', confidence: 93 },
      { id: 'vr-9', sourceId: 'v-5', targetId: 'v-1', type: 'CALLS', weight: 28, sourceEvidence: 'CDR #55', confidence: 91 },
      { id: 'vr-10', sourceId: 'v-3', targetId: 'v-8', type: 'ASSOCIATED_WITH', weight: 2, sourceEvidence: 'Registry check', confidence: 85 }
    ],
    alerts: [
      { id: 'valt-1', title: 'Duplicate Chassis Number Match', description: 'Two identical chassis numbers active simultaneously in Delhi and Jaipur.', priority: 'HIGH', category: 'LOCATION', entityIds: ['v-2', 'v-6'], timestamp: '2026-08-21 18:20:00', status: 'NEW' }
    ],
    evidenceSources: [
      { id: 'vev-1', title: 'Forensic Automobile Examination Report', type: 'RTO_REGISTRY', referenceId: 'RTO-DEL-89', timestamp: '2026-08-19', confidence: 96, verified: true, summary: 'Laser etching evidence confirming punch-over of original engine numbers.' }
    ],
    tasks: [
      { id: 'vtsk-1', title: 'Raid Karnal Chop Shop', description: 'Execute search warrant at Industrial Area plot.', assignedOfficer: 'Cmdr. V. R. Sharma', priority: 'URGENT', dueDate: '2026-08-25', status: 'TODO', createdDate: '2026-08-18' }
    ],
    relatedCases: [
      { 
        id: 'vrc-1', 
        caseNumber: 'NDPS-118/2024', 
        title: 'Operation Syndicate Link - Narcotic & Financial Nexus', 
        category: 'NARCOTICS', 
        sharedEntities: 2, 
        sharedLocations: 2, 
        sharedRelationships: 3, 
        confidence: 82, 
        linked: false,
        relationReason: 'Cloned vehicle plates (MH12 AB 1234) detected during toll transit in Mumbai-Pune corridor.',
        status: 'ACTIVE',
        priority: 'HIGH',
        year: '2024'
      },
      { 
        id: 'vrc-2', 
        caseNumber: 'PROPERTY-119/2023', 
        title: 'Land Grabbing & Forged Title Deed Syndicate', 
        category: 'PROPERTY_CRIME', 
        sharedEntities: 2, 
        sharedLocations: 1, 
        sharedRelationships: 2, 
        confidence: 76, 
        linked: false,
        relationReason: 'Forged stamp papers sourced from same counterfeit ring in Karnal.',
        status: 'ACTIVE',
        priority: 'MEDIUM',
        year: '2023'
      }
    ],
    roadmapSteps: [
      { stepId: 'vstep-1', title: 'ANPR Camera Correlation', description: 'Match toll logs for cloned vehicles.', category: 'Phase 1', status: 'COMPLETED', targetModule: 'heatmap' }
    ]
  },
  'PROPERTY-119/2023': {
    entities: [
      { id: 'p-1', name: 'Advocate Madhukar Joshi', type: 'PERSON', riskScore: 86, riskLevel: 'HIGH', confidence: 95, connectionsCount: 4, details: { age: 54, phone: '+91 98220-11223', address: 'Deccan Gymkhana, Pune', notes: 'Masterminded land revenue record tampering.' }, x: 400, y: 300, cluster: 'PropCluster' },
      { id: 'p-2', name: 'Survey No. 112/2 Commercial Plot', type: 'LOCATION', riskScore: 88, riskLevel: 'HIGH', confidence: 98, connectionsCount: 3, details: { address: 'Baner Road, Pune (Valued at ₹ 28 Cr)' }, x: 600, y: 250, cluster: 'PropCluster' },
      { id: 'p-3', name: 'Pune Land Records Archive', type: 'ORGANIZATION', riskScore: 60, riskLevel: 'MEDIUM', confidence: 99, connectionsCount: 3, details: { companyType: 'Govt Revenue Dept' }, x: 500, y: 450, cluster: 'PropCluster' },
      { id: 'p-4', name: '+91 98220-11223', type: 'PHONE', riskScore: 82, riskLevel: 'HIGH', confidence: 97, connectionsCount: 2, details: { companyType: 'BSNL Landline & Mobile' }, x: 250, y: 200, cluster: 'PropCluster' },
      { id: 'p-5', name: 'Vilasrao Deshmukh (Imposter)', type: 'PERSON', riskScore: 85, riskLevel: 'HIGH', confidence: 94, connectionsCount: 3, details: { age: 61, address: 'Kothrud, Pune' }, x: 300, y: 550, cluster: 'PropCluster' },
      { id: 'p-6', name: 'Sahyadri Shelters Pvt Ltd', type: 'ORGANIZATION', riskScore: 84, riskLevel: 'HIGH', confidence: 92, connectionsCount: 2, details: { companyType: 'Real Estate Developer' }, x: 700, y: 400, cluster: 'PropCluster' },
      { id: 'p-7', name: 'Forged Sale Deed 2023/992', type: 'EVENT' as any, riskScore: 89, riskLevel: 'HIGH', confidence: 96, connectionsCount: 2, details: { address: 'Sub-Registrar Office Haveli #4' }, x: 450, y: 150, cluster: 'PropCluster' },
      { id: 'p-8', name: 'Bank of Maharashtra AC #112', type: 'ACCOUNT' as any, riskScore: 80, riskLevel: 'HIGH', confidence: 95, connectionsCount: 2, details: { balance: '₹ 4.5 Cr Escrow Deposit' }, x: 650, y: 600, cluster: 'PropCluster' }
    ],
    relationships: [
      { id: 'pr-1', sourceId: 'p-1', targetId: 'p-7', type: 'ASSOCIATED_WITH', weight: 1, sourceEvidence: 'Notary Log #44', confidence: 97 },
      { id: 'pr-2', sourceId: 'p-1', targetId: 'p-4', type: 'CALLS', weight: 38, sourceEvidence: 'CDR #10', confidence: 95 },
      { id: 'pr-3', sourceId: 'p-5', targetId: 'p-7', type: 'ASSOCIATED_WITH', weight: 1, sourceEvidence: 'Deed Signatory', confidence: 96 },
      { id: 'pr-4', sourceId: 'p-5', targetId: 'p-1', type: 'CALLS', weight: 22, sourceEvidence: 'CDR #14', confidence: 91 },
      { id: 'pr-5', sourceId: 'p-2', targetId: 'p-3', type: 'VISITED', weight: 14, sourceEvidence: 'Revenue Register', confidence: 94 },
      { id: 'pr-6', sourceId: 'p-6', targetId: 'p-2', type: 'OWNS', weight: 1, sourceEvidence: 'Agreement to Sell', confidence: 90 },
      { id: 'pr-7', sourceId: 'p-6', targetId: 'p-8', type: 'TRANSFERRED_FUNDS', weight: 5, sourceEvidence: 'Escrow Stmt #02', confidence: 93 },
      { id: 'pr-8', sourceId: 'p-1', targetId: 'p-8', type: 'TRANSFERRED_FUNDS', weight: 3, sourceEvidence: 'Fee Receipt #99', confidence: 89 },
      { id: 'pr-9', sourceId: 'p-5', targetId: 'p-3', type: 'VISITED', weight: 8, sourceEvidence: 'CCTV #01', confidence: 88 }
    ],
    alerts: [
      { id: 'palt-1', title: 'Archival Ink Discrepancy', description: 'Land revenue ledger entry uses chemical ink inconsistent with 1968 manufacturing date.', priority: 'HIGH', category: 'NETWORK', entityIds: ['p-3', 'p-2'], timestamp: '2026-08-20 11:00:00', status: 'RESOLVED' }
    ],
    evidenceSources: [
      { id: 'pev-1', title: 'Handwriting & Forensic Ink Analysis', type: 'FIR', referenceId: 'FOR-PUNE-11', timestamp: '2023-11-10', confidence: 98, verified: true, summary: 'Spectroscopic examination confirms document was written within last 12 months.' }
    ],
    tasks: [
      { id: 'ptsk-1', title: 'Attach Property Title Deed', description: 'Issue prohibitory injunction under CrPC Section 102.', assignedOfficer: 'Cmdr. V. R. Sharma', priority: 'HIGH', dueDate: '2023-12-01', status: 'COMPLETED', createdDate: '2023-09-20' }
    ],
    relatedCases: [
      { 
        id: 'prc-1', 
        caseNumber: 'FRAUD-204/2024', 
        title: 'Hawala Shell Conduit & Multi-Bank Fraud Ring', 
        category: 'FRAUD', 
        sharedEntities: 2, 
        sharedLocations: 1, 
        sharedRelationships: 2, 
        confidence: 79, 
        linked: false,
        relationReason: 'Escrow account payments for forged deeds financed by Zenith Bullion hawala conduits.',
        status: 'ACTIVE',
        priority: 'MEDIUM',
        year: '2024'
      },
      { 
        id: 'prc-2', 
        caseNumber: 'VEH-087/2025', 
        title: 'Inter-State Vehicle Cloning & Highway Transit Syndicate', 
        category: 'VEHICLE_CRIME', 
        sharedEntities: 2, 
        sharedLocations: 1, 
        sharedRelationships: 2, 
        confidence: 76, 
        linked: false,
        relationReason: 'Imposter suspects used cloned registration plates for court appearances.',
        status: 'UNDER_REVIEW',
        priority: 'LOW',
        year: '2025'
      }
    ],
    roadmapSteps: [
      { stepId: 'pstep-1', title: 'Verify Revenue Registry', description: 'Inspect 50-year land mutation logs.', category: 'Phase 1', status: 'COMPLETED', targetModule: 'evidence' }
    ]
  },
  'NARC-061/2024': {
    entities: [
      { id: 'n-1', name: 'Dr. Raghavendra Rao', type: 'PERSON', riskScore: 91, riskLevel: 'CRITICAL', confidence: 97, connectionsCount: 5, details: { age: 52, phone: '+91 99490-55667', address: 'Banjara Hills, Hyderabad', notes: 'Director of PharmaSynth API Labs.' }, x: 400, y: 300, cluster: 'NarcCluster' },
      { id: 'n-2', name: 'PharmaSynth API Labs', type: 'ORGANIZATION', riskScore: 93, riskLevel: 'CRITICAL', confidence: 98, connectionsCount: 4, details: { companyType: 'Licensed Bulk Drug Manufacturer', address: 'Jeedimetla Industrial Estate, Hyderabad', balance: '₹ 18.5 Cr' }, x: 600, y: 250, cluster: 'NarcCluster' },
      { id: 'n-3', name: '+91 99490-55667', type: 'PHONE', riskScore: 88, riskLevel: 'HIGH', confidence: 99, connectionsCount: 3, details: { companyType: 'Airtel Postpaid' }, x: 250, y: 200, cluster: 'NarcCluster' },
      { id: 'n-4', name: 'AP 28 BC 4412', type: 'VEHICLE', riskScore: 86, riskLevel: 'HIGH', confidence: 95, connectionsCount: 3, details: { vehicleNumber: 'AP 28 BC 4412', companyType: 'Refrigerated Transport Van' }, x: 500, y: 450, cluster: 'NarcCluster' },
      { id: 'n-5', name: 'Syed Akbar', type: 'PERSON', riskScore: 84, riskLevel: 'HIGH', confidence: 92, connectionsCount: 3, details: { age: 39, address: 'Secunderabad, Hyderabad' }, x: 300, y: 550, cluster: 'NarcCluster' },
      { id: 'n-6', name: 'Express Cargo Hub', type: 'LOCATION', riskScore: 80, riskLevel: 'HIGH', confidence: 91, connectionsCount: 3, details: { address: 'RGIA Airport Cargo Complex, Hyderabad' }, x: 700, y: 400, cluster: 'NarcCluster' },
      { id: 'n-7', name: 'Bank of Baroda AC #7712', type: 'ACCOUNT' as any, riskScore: 85, riskLevel: 'HIGH', confidence: 96, connectionsCount: 2, details: { balance: '₹ 2.1 Cr Undisclosed' }, x: 450, y: 150, cluster: 'NarcCluster' },
      { id: 'n-8', name: 'Controlled Precursor Logs', type: 'EVENT' as any, riskScore: 78, riskLevel: 'HIGH', confidence: 94, connectionsCount: 2, details: { address: 'Batch #902 - Ephedrine Diversion' }, x: 650, y: 600, cluster: 'NarcCluster' }
    ],
    relationships: [
      { id: 'nr-1', sourceId: 'n-1', targetId: 'n-2', type: 'OWNS', weight: 1, sourceEvidence: 'MCA Registry #12', confidence: 99 },
      { id: 'nr-2', sourceId: 'n-1', targetId: 'n-3', type: 'CALLS', weight: 74, sourceEvidence: 'CDR #44', confidence: 98 },
      { id: 'nr-3', sourceId: 'n-2', targetId: 'n-8', type: 'ASSOCIATED_WITH', weight: 1, sourceEvidence: 'Excise Audit #04', confidence: 96 },
      { id: 'nr-4', sourceId: 'n-4', targetId: 'n-6', type: 'VISITED', weight: 29, sourceEvidence: 'Cargo CCTV #19', confidence: 94 },
      { id: 'nr-5', sourceId: 'n-5', targetId: 'n-4', type: 'OWNS', weight: 1, sourceEvidence: 'Transport Permit', confidence: 91 },
      { id: 'nr-6', sourceId: 'n-5', targetId: 'n-1', type: 'CALLS', weight: 41, sourceEvidence: 'CDR #88', confidence: 95 },
      { id: 'nr-7', sourceId: 'n-2', targetId: 'n-7', type: 'TRANSFERRED_FUNDS', weight: 12, sourceEvidence: 'FIU Stmt #01', confidence: 97 },
      { id: 'nr-8', sourceId: 'n-6', targetId: 'n-8', type: 'VISITED', weight: 8, sourceEvidence: 'Waybill #412', confidence: 92 },
      { id: 'nr-9', sourceId: 'n-5', targetId: 'n-6', type: 'VISITED', weight: 16, sourceEvidence: 'Gate Log #90', confidence: 90 },
      { id: 'nr-10', sourceId: 'n-3', targetId: 'n-5', type: 'CALLS', weight: 35, sourceEvidence: 'CDR #92', confidence: 93 }
    ],
    alerts: [
      { id: 'nalt-1', title: 'Precursor Inventory Mismatch', description: '450kg of Ephedrine missing from factory batch #902 without export documentation.', priority: 'HIGH', category: 'FINANCIAL', entityIds: ['n-2', 'n-8'], timestamp: '2026-07-15 10:00:00', status: 'RESOLVED' }
    ],
    evidenceSources: [
      { id: 'nev-1', title: 'State Excise & Drug Control Inspection', type: 'FIR', referenceId: 'HYD-EX-88', timestamp: '2024-05-12', confidence: 99, verified: true, summary: 'Seizure of clandestine chemical processing vats in Jeedimetla.' }
    ],
    tasks: [
      { id: 'ntsk-1', title: 'File Prosecution Charge-Sheet', description: 'Submit NDPS special court final report.', assignedOfficer: 'Priya Nair', priority: 'HIGH', dueDate: '2024-07-28', status: 'COMPLETED', createdDate: '2024-06-01' }
    ],
    relatedCases: [
      { 
        id: 'nrc-1', 
        caseNumber: 'NDPS-118/2024', 
        title: 'Operation Syndicate Link - Narcotic & Financial Nexus', 
        category: 'NARCOTICS', 
        sharedEntities: 3, 
        sharedLocations: 1, 
        sharedRelationships: 4, 
        confidence: 89, 
        linked: false,
        relationReason: 'Precursor chemicals from PharmaSynth API Labs diverted to Andheri East distribution warehouse.',
        status: 'ACTIVE',
        priority: 'HIGH',
        year: '2024'
      },
      { 
        id: 'nrc-2', 
        caseNumber: 'FRAUD-204/2024', 
        title: 'Hawala Shell Conduit & Multi-Bank Fraud Ring', 
        category: 'FRAUD', 
        sharedEntities: 2, 
        sharedLocations: 1, 
        sharedRelationships: 3, 
        confidence: 81, 
        linked: false,
        relationReason: 'Bank of Baroda pharma account transferred undisclosed capital through HDFC AC #9921.',
        status: 'ACTIVE',
        priority: 'MEDIUM',
        year: '2024'
      }
    ],
    roadmapSteps: [
      { stepId: 'nstep-1', title: 'Audit Precursor Ledger', description: 'Reconcile chemical input vs output.', category: 'Phase 1', status: 'COMPLETED', targetModule: 'reports' }
    ]
  }
};

// Case-Specific Case Team Members with Deterministic Deliverables & Accurate Performance Stats
export const caseTeamByCase: Record<string, CaseOfficer[]> = {
  'NDPS-118/2024': [
    {
      id: 'off-1',
      name: 'Cmdr. V. R. Sharma',
      role: 'LEAD_INVESTIGATOR',
      status: 'AVAILABLE',
      assignedTasks: 8,
      completedTasks: 6,
      assignedTasksCount: 8,
      completedTasksCount: 6,
      lastActive: '12m ago',
      lastActivity: '12m ago',
      contribution: 'Overall case command, inter-state warrant coordination, and syndicate leader prosecution.',
      deliverables: [
        { id: 'del-1', title: 'Network Centrality Analysis & Node Prioritization', priority: 'HIGH', status: 'COMPLETED', dueDate: '18 Aug 2026', progress: 100, notes: 'Completed graph centrality verification identifying Arjun Verma as bridge node.' },
        { id: 'del-2', title: 'Entity Resolution Review (MH12 Fortuner Cross-Match)', priority: 'HIGH', status: 'IN_PROGRESS', dueDate: '24 Aug 2026', progress: 65, notes: 'Cross-referencing RTO plate database with toll ANPR logs.' },
        { id: 'del-3', title: 'Statutory Inter-Agency Intelligence Summary Report', priority: 'MEDIUM', status: 'PENDING', dueDate: '28 Aug 2026', progress: 0, notes: 'Awaiting final bank transaction certification from FIU.' }
      ]
    },
    {
      id: 'off-2',
      name: 'Insp. Priya Nair',
      role: 'INVESTIGATOR',
      status: 'IN_FIELD',
      assignedTasks: 6,
      completedTasks: 5,
      assignedTasksCount: 6,
      completedTasksCount: 5,
      lastActive: '45m ago',
      lastActivity: '45m ago',
      contribution: 'Shell corporation beneficial ownership mapping and Hawala bank account audit.',
      deliverables: [
        { id: 'del-4', title: 'Shellco Logistics Bank Account Audit', priority: 'HIGH', status: 'COMPLETED', dueDate: '20 Aug 2026', progress: 100, notes: 'Traced ₹42.5L inward hawala tranches back to HDFC AC #9921.' },
        { id: 'del-5', title: 'Hawala Money Flow Topology Charting', priority: 'URGENT', status: 'IN_PROGRESS', dueDate: '25 Aug 2026', progress: 80, notes: 'Identified 3 intermediary cash couriers operating in Opera House, Mumbai.' }
      ]
    },
    {
      id: 'off-3',
      name: 'Dr. Vikram Joshi',
      role: 'ANALYST',
      status: 'AVAILABLE',
      assignedTasks: 7,
      completedTasks: 7,
      assignedTasksCount: 7,
      completedTasksCount: 7,
      lastActive: '1h ago',
      lastActivity: '1h ago',
      contribution: 'Call Detail Record (CDR) tower triangulation and digital forensic signal extraction.',
      deliverables: [
        { id: 'del-6', title: 'Andheri East Cell Tower Triangulation', priority: 'HIGH', status: 'COMPLETED', dueDate: '19 Aug 2026', progress: 100, notes: 'Isolated 14 nocturnal handset handshakes between Arjun Verma and Rohit Sinha.' },
        { id: 'del-7', title: 'ANPR Toll Plaza Correlation Graph', priority: 'MEDIUM', status: 'COMPLETED', dueDate: '22 Aug 2026', progress: 100, notes: 'Confirmed Fortuner MH12 AB 1234 midnight transits without active FASTag.' }
      ]
    },
    {
      id: 'off-4',
      name: 'Director General A. Sen',
      role: 'ADMIN',
      status: 'AVAILABLE',
      assignedTasks: 3,
      completedTasks: 3,
      assignedTasksCount: 3,
      completedTasksCount: 3,
      lastActive: '3h ago',
      lastActivity: '3h ago',
      contribution: 'Senior executive oversight, judicial authorization, and inter-state command sign-offs.',
      deliverables: [
        { id: 'del-8', title: 'Inter-Agency Search & Seizure Warrant Endorsement', priority: 'URGENT', status: 'COMPLETED', dueDate: '16 Aug 2026', progress: 100, notes: 'Special court search authorization granted for Andheri warehouse.' }
      ]
    }
  ],
  'FRAUD-204/2024': [
    {
      id: 'off-2',
      name: 'Insp. Priya Nair',
      role: 'LEAD_INVESTIGATOR',
      status: 'AVAILABLE',
      assignedTasks: 9,
      completedTasks: 7,
      assignedTasksCount: 9,
      completedTasksCount: 7,
      lastActive: '10m ago',
      lastActivity: '10m ago',
      contribution: 'Forensic accounting, fictitious bill of entry audit, and multi-bank asset freezes.',
      deliverables: [
        { id: 'del-f1', title: 'Apex Global Impex Forensic Accounting Dossier', priority: 'HIGH', status: 'COMPLETED', dueDate: '19 Aug 2026', progress: 100, notes: 'Unmasked ₹14.2 Cr overseas fictitious trade invoicing.' },
        { id: 'del-f2', title: 'RBI Inward Remittance Reconciliation Audit', priority: 'URGENT', status: 'IN_PROGRESS', dueDate: '26 Aug 2026', progress: 70, notes: 'Auditing 45 layered outward remittance tranches.' },
        { id: 'del-f3', title: 'PMLA Section 17 Statutory Freezing Notice', priority: 'HIGH', status: 'IN_PROGRESS', dueDate: '27 Aug 2026', progress: 50, notes: 'Drafting asset attachment memo for BKC corporate office.' }
      ]
    },
    {
      id: 'off-3',
      name: 'Dr. Vikram Joshi',
      role: 'ANALYST',
      status: 'AVAILABLE',
      assignedTasks: 6,
      completedTasks: 6,
      assignedTasksCount: 6,
      completedTasksCount: 6,
      lastActive: '35m ago',
      lastActivity: '35m ago',
      contribution: 'Financial network graph analysis, multi-hop wire hops, and director relationship mapping.',
      deliverables: [
        { id: 'del-f4', title: 'Bank Account Multi-Hop Link Graph', priority: 'HIGH', status: 'COMPLETED', dueDate: '20 Aug 2026', progress: 100, notes: 'Mapped funds transfer path from Kiran Mehta to Zenith Bullion Traders.' },
        { id: 'del-f5', title: 'Shell Company Directorship Cross-Index', priority: 'MEDIUM', status: 'COMPLETED', dueDate: '21 Aug 2026', progress: 100, notes: 'Discovered 4 dummy directors listed on Ministry of Corporate Affairs filings.' }
      ]
    },
    {
      id: 'off-1',
      name: 'Cmdr. V. R. Sharma',
      role: 'INVESTIGATOR',
      status: 'IN_FIELD',
      assignedTasks: 5,
      completedTasks: 4,
      assignedTasksCount: 5,
      completedTasksCount: 4,
      lastActive: '2h ago',
      lastActivity: '2h ago',
      contribution: 'BKC commercial premise inspection and suspect director deposition summons.',
      deliverables: [
        { id: 'del-f6', title: 'BKC Corporate Office Physical Raid & Computer Seizure', priority: 'HIGH', status: 'COMPLETED', dueDate: '21 Aug 2026', progress: 100, notes: 'Seized hard drives and ledger stamps at Bandra Kurla Complex.' },
        { id: 'del-f7', title: 'Director Subpoena & Deposition Memo', priority: 'MEDIUM', status: 'IN_PROGRESS', dueDate: '28 Aug 2026', progress: 40, notes: 'Summoned Kiran Mehta and Sanjay Shah for formal interrogation.' }
      ]
    },
    {
      id: 'off-4',
      name: 'Director General A. Sen',
      role: 'ADMIN',
      status: 'AVAILABLE',
      assignedTasks: 2,
      completedTasks: 2,
      assignedTasksCount: 2,
      completedTasksCount: 2,
      lastActive: '4h ago',
      lastActivity: '4h ago',
      contribution: 'Enforcement Directorate inter-agency transfer and statutory freezing approval.',
      deliverables: [
        { id: 'del-f8', title: 'FIU-IND Red Notice Inter-Agency Signoff', priority: 'HIGH', status: 'COMPLETED', dueDate: '18 Aug 2026', progress: 100, notes: 'Approved international mutual legal assistance request.' }
      ]
    }
  ],
  'CYBER-032/2025': [
    {
      id: 'off-3',
      name: 'Dr. Vikram Joshi',
      role: 'LEAD_INVESTIGATOR',
      status: 'AVAILABLE',
      assignedTasks: 10,
      completedTasks: 9,
      assignedTasksCount: 10,
      completedTasksCount: 9,
      lastActive: '5m ago',
      lastActivity: '5m ago',
      contribution: 'Cryptocurrency forensic tracing, Tor exit node packet inspection, and smart contract audit.',
      deliverables: [
        { id: 'del-c1', title: 'Bitcoin Mixer De-anonymization Graph', priority: 'URGENT', status: 'COMPLETED', dueDate: '20 Aug 2026', progress: 100, notes: 'Unbundled 142.5 BTC mixer pool back to suspect deposit cluster.' },
        { id: 'del-c2', title: 'Tor Exit Node Traffic Correlation (Frankfurt Relay)', priority: 'HIGH', status: 'COMPLETED', dueDate: '22 Aug 2026', progress: 100, notes: 'Correlated timestamp packet bursts with Bengaluru ISP lease records.' },
        { id: 'del-c3', title: 'Ethereum Smart Contract Seed Phrase Mapping', priority: 'HIGH', status: 'IN_PROGRESS', dueDate: '26 Aug 2026', progress: 85, notes: 'Identified secondary wallet 0x71C...392A holding 450 ETH.' }
      ]
    },
    {
      id: 'off-2',
      name: 'Insp. Priya Nair',
      role: 'INVESTIGATOR',
      status: 'IN_FIELD',
      assignedTasks: 4,
      completedTasks: 3,
      assignedTasksCount: 4,
      completedTasksCount: 3,
      lastActive: '1h ago',
      lastActivity: '1h ago',
      contribution: 'Centralized crypto exchange KYC subpoenas and cold-storage hardware seizure.',
      deliverables: [
        { id: 'del-c4', title: 'Crypto Exchange KYC Subpoena Service', priority: 'HIGH', status: 'COMPLETED', dueDate: '21 Aug 2026', progress: 100, notes: 'Received verified passport and Aadhaar matching Rohan Deshmukh.' },
        { id: 'del-c5', title: 'Cold Storage Ledger Hardware Seizure Protocol', priority: 'URGENT', status: 'IN_PROGRESS', dueDate: '27 Aug 2026', progress: 50, notes: 'Preparing forensic chain of custody for hardware wallet acquisition.' }
      ]
    },
    {
      id: 'off-1',
      name: 'Cmdr. V. R. Sharma',
      role: 'INVESTIGATOR',
      status: 'AVAILABLE',
      assignedTasks: 4,
      completedTasks: 3,
      assignedTasksCount: 4,
      completedTasksCount: 3,
      lastActive: '2h ago',
      lastActivity: '2h ago',
      contribution: 'Koramangala server farm physical security audit and suspect perimeter surveillance.',
      deliverables: [
        { id: 'del-c6', title: 'Koramangala 4th Block Physical Reconnaissance', priority: 'MEDIUM', status: 'COMPLETED', dueDate: '22 Aug 2026', progress: 100, notes: 'Verified Alexandre Mercer residence and physical security cameras.' },
        { id: 'del-c7', title: 'TechVault Server Rack Custody Transfer', priority: 'HIGH', status: 'IN_PROGRESS', dueDate: '25 Aug 2026', progress: 60, notes: 'Secured mirror image of DELL-POWEREDGE-99 server unit.' }
      ]
    },
    {
      id: 'off-4',
      name: 'Director General A. Sen',
      role: 'ADMIN',
      status: 'AVAILABLE',
      assignedTasks: 3,
      completedTasks: 3,
      assignedTasksCount: 3,
      completedTasksCount: 3,
      lastActive: '5h ago',
      lastActivity: '5h ago',
      contribution: 'CERT-In national incident coordination and Interpol Cyber Division liaison.',
      deliverables: [
        { id: 'del-c8', title: 'Interpol Cyber Alert & Red Notice Endorsement', priority: 'HIGH', status: 'COMPLETED', dueDate: '19 Aug 2026', progress: 100, notes: 'Notified European law enforcement of Frankfurt exit node relay operation.' }
      ]
    }
  ],
  'VEH-087/2025': [
    {
      id: 'off-1',
      name: 'Cmdr. V. R. Sharma',
      role: 'LEAD_INVESTIGATOR',
      status: 'AVAILABLE',
      assignedTasks: 7,
      completedTasks: 5,
      assignedTasksCount: 7,
      completedTasksCount: 5,
      lastActive: '15m ago',
      lastActivity: '15m ago',
      contribution: 'Chop shop network takedown, inter-state transit interception, and highway surveillance.',
      deliverables: [
        { id: 'del-v1', title: 'Karnal Chop Shop Garage Tactical Reconnaissance', priority: 'URGENT', status: 'COMPLETED', dueDate: '20 Aug 2026', progress: 100, notes: 'Confirmed punch-over machinery and 6 disassembled SUV chassis on site.' },
        { id: 'del-v2', title: 'Delhi-Jaipur Highway Transit Interception Plan', priority: 'HIGH', status: 'IN_PROGRESS', dueDate: '25 Aug 2026', progress: 75, notes: 'Deploying ANPR highway checkpoint squads at KM Marker 42.' }
      ]
    },
    {
      id: 'off-3',
      name: 'Dr. Vikram Joshi',
      role: 'ANALYST',
      status: 'AVAILABLE',
      assignedTasks: 5,
      completedTasks: 5,
      assignedTasksCount: 5,
      completedTasksCount: 5,
      lastActive: '40m ago',
      lastActivity: '40m ago',
      contribution: 'FASTag toll database correlation and automated chassis duplicate detection.',
      deliverables: [
        { id: 'del-v3', title: 'ANPR FASTag Toll Correlation Matrix', priority: 'HIGH', status: 'COMPLETED', dueDate: '21 Aug 2026', progress: 100, notes: 'Proved simultaneous presence of HR 26 DK 9011 at two disparate toll booths.' },
        { id: 'del-v4', title: 'National RTO Database Cloned Vehicle Query', priority: 'HIGH', status: 'COMPLETED', dueDate: '22 Aug 2026', progress: 100, notes: 'Identified 18 donor registration records compromised by inside actors.' }
      ]
    },
    {
      id: 'off-2',
      name: 'Insp. Priya Nair',
      role: 'INVESTIGATOR',
      status: 'IN_FIELD',
      assignedTasks: 4,
      completedTasks: 3,
      assignedTasksCount: 4,
      completedTasksCount: 3,
      lastActive: '1h ago',
      lastActivity: '1h ago',
      contribution: 'RTO insider investigation and forged Registration Certificate (RC) paper trail.',
      deliverables: [
        { id: 'del-v5', title: 'RTO Registry Security Vulnerability Audit', priority: 'MEDIUM', status: 'COMPLETED', dueDate: '21 Aug 2026', progress: 100, notes: 'Tracked unauthorized login credentials used to modify vehicle records.' },
        { id: 'del-v6', title: 'Counterfeit RC Paper Seizure & Confiscation Memo', priority: 'MEDIUM', status: 'IN_PROGRESS', dueDate: '28 Aug 2026', progress: 40, notes: 'Seized 24 blank smart cards and embossed holographic foils.' }
      ]
    },
    {
      id: 'off-4',
      name: 'Director General A. Sen',
      role: 'ADMIN',
      status: 'AVAILABLE',
      assignedTasks: 2,
      completedTasks: 2,
      assignedTasksCount: 2,
      completedTasksCount: 2,
      lastActive: '3h ago',
      lastActivity: '3h ago',
      contribution: 'Inter-State Police Council coordination between Haryana, Delhi, and UP police.',
      deliverables: [
        { id: 'del-v7', title: 'Multi-State Stolen Vehicle Enforcement Directive', priority: 'HIGH', status: 'COMPLETED', dueDate: '17 Aug 2026', progress: 100, notes: 'Issued synchronized border checkpoint inspection orders.' }
      ]
    }
  ],
  'PROPERTY-119/2023': [
    {
      id: 'off-1',
      name: 'Cmdr. V. R. Sharma',
      role: 'LEAD_INVESTIGATOR',
      status: 'AVAILABLE',
      assignedTasks: 6,
      completedTasks: 5,
      assignedTasksCount: 6,
      completedTasksCount: 5,
      lastActive: '20m ago',
      lastActivity: '20m ago',
      contribution: 'Revenue archive inspection, forged deed attachment, and notary fraud prosecution.',
      deliverables: [
        { id: 'del-p1', title: 'Pune Land Records Revenue Archive Record Impoundment', priority: 'HIGH', status: 'COMPLETED', dueDate: '19 Aug 2026', progress: 100, notes: 'Impounded physical mutation registers for Survey No. 112/2 Baner.' },
        { id: 'del-p2', title: 'Notary Signature & Stamp Authenticity Verification', priority: 'HIGH', status: 'COMPLETED', dueDate: '21 Aug 2026', progress: 100, notes: 'Confirmed deceased notary stamp was forged on Sale Deed 2023/992.' },
        { id: 'del-p3', title: 'Commercial Plot Judicial Prohibitory Injunction Notice', priority: 'HIGH', status: 'IN_PROGRESS', dueDate: '27 Aug 2026', progress: 60, notes: 'Served prohibitory order preventing third-party sale of Baner plot.' }
      ]
    },
    {
      id: 'off-2',
      name: 'Insp. Priya Nair',
      role: 'INVESTIGATOR',
      status: 'AVAILABLE',
      assignedTasks: 5,
      completedTasks: 4,
      assignedTasksCount: 5,
      completedTasksCount: 4,
      lastActive: '50m ago',
      lastActivity: '50m ago',
      contribution: 'Escrow account forensic accounting and developer corporate tie-in analysis.',
      deliverables: [
        { id: 'del-p4', title: 'Bank of Maharashtra Escrow Deposit Trail Audit', priority: 'HIGH', status: 'COMPLETED', dueDate: '20 Aug 2026', progress: 100, notes: 'Traced ₹4.5 Cr advance token payment back to Sahyadri Shelters.' },
        { id: 'del-p5', title: 'Real Estate Developer Directorship Review', priority: 'MEDIUM', status: 'IN_PROGRESS', dueDate: '26 Aug 2026', progress: 75, notes: 'Verified beneficial ownership links to Advocate Madhukar Joshi.' }
      ]
    },
    {
      id: 'off-3',
      name: 'Dr. Vikram Joshi',
      role: 'ANALYST',
      status: 'AVAILABLE',
      assignedTasks: 4,
      completedTasks: 4,
      assignedTasksCount: 4,
      completedTasksCount: 4,
      lastActive: '2h ago',
      lastActivity: '2h ago',
      contribution: 'Document spectroscopy, forensic ink dating, and revenue map link graphs.',
      deliverables: [
        { id: 'del-p6', title: 'Archival Ink Spectroscopic Age Analysis', priority: 'HIGH', status: 'COMPLETED', dueDate: '18 Aug 2026', progress: 100, notes: 'Certified that 1968 document entry was inscribed with modern gel ink.' },
        { id: 'del-p7', title: 'Revenue Cadastral Map Link Overlay', priority: 'MEDIUM', status: 'COMPLETED', dueDate: '22 Aug 2026', progress: 100, notes: 'Rendered GIS boundary discrepancies for Baner commercial zone.' }
      ]
    },
    {
      id: 'off-4',
      name: 'Director General A. Sen',
      role: 'ADMIN',
      status: 'AVAILABLE',
      assignedTasks: 2,
      completedTasks: 2,
      assignedTasksCount: 2,
      completedTasksCount: 2,
      lastActive: '6h ago',
      lastActivity: '6h ago',
      contribution: 'Special Land Tribunal briefing and state revenue board escalation.',
      deliverables: [
        { id: 'del-p8', title: 'State Revenue Tribunal Executive Briefing Memo', priority: 'HIGH', status: 'COMPLETED', dueDate: '15 Aug 2026', progress: 100, notes: 'Presented conclusive forensic proof of forged government registry entries.' }
      ]
    }
  ],
  'NARC-061/2024': [
    {
      id: 'off-2',
      name: 'Insp. Priya Nair',
      role: 'LEAD_INVESTIGATOR',
      status: 'AVAILABLE',
      assignedTasks: 8,
      completedTasks: 8,
      assignedTasksCount: 8,
      completedTasksCount: 8,
      lastActive: '10m ago',
      lastActivity: '10m ago',
      contribution: 'Pharma API lab raid, chemical seizure audit, and final NDPS prosecution charge-sheet.',
      deliverables: [
        { id: 'del-n1', title: 'PharmaSynth API Labs Special Court Charge-Sheet', priority: 'URGENT', status: 'COMPLETED', dueDate: '15 Jul 2024', progress: 100, notes: 'Submitted 420-page evidence dossier under NDPS Act Sections 8(c) & 22(c).' },
        { id: 'del-n2', title: 'RGIA Airport Cargo Waybill Reconciliation', priority: 'HIGH', status: 'COMPLETED', dueDate: '20 Jul 2024', progress: 100, notes: 'Reconciled 450kg diverted Ephedrine batch #902 disguised as excipient powder.' },
        { id: 'del-n3', title: 'State Excise Controlled Precursor Ledger Audit', priority: 'HIGH', status: 'COMPLETED', dueDate: '25 Jul 2024', progress: 100, notes: 'Confirmed discrepancy between declared factory yield and bulk sales.' }
      ]
    },
    {
      id: 'off-1',
      name: 'Cmdr. V. R. Sharma',
      role: 'INVESTIGATOR',
      status: 'AVAILABLE',
      assignedTasks: 5,
      completedTasks: 5,
      assignedTasksCount: 5,
      completedTasksCount: 5,
      lastActive: '1h ago',
      lastActivity: '1h ago',
      contribution: 'Director custodial interrogation and inter-state distribution conduit closure.',
      deliverables: [
        { id: 'del-n4', title: 'Dr. Raghavendra Rao Custodial Interrogation Memo', priority: 'HIGH', status: 'COMPLETED', dueDate: '18 Jul 2024', progress: 100, notes: 'Obtained confession regarding clandestine off-book pharmaceutical production.' },
        { id: 'del-n5', title: 'Refrigerated Transport Courier Network Shutdown', priority: 'HIGH', status: 'COMPLETED', dueDate: '24 Jul 2024', progress: 100, notes: 'Impounded vehicle AP 28 BC 4412 and arrested driver Syed Akbar.' }
      ]
    },
    {
      id: 'off-3',
      name: 'Dr. Vikram Joshi',
      role: 'ANALYST',
      status: 'AVAILABLE',
      assignedTasks: 6,
      completedTasks: 6,
      assignedTasksCount: 6,
      completedTasksCount: 6,
      lastActive: '2h ago',
      lastActivity: '2h ago',
      contribution: 'Chemical synthesis pathway mapping and multi-city supplier link graph.',
      deliverables: [
        { id: 'del-n6', title: 'Clandestine Chemical Synthesis Vector Analysis', priority: 'HIGH', status: 'COMPLETED', dueDate: '19 Jul 2024', progress: 100, notes: 'Proved laboratory capacity to synthesize 120kg MDMA per production batch.' },
        { id: 'del-n7', title: 'Multi-City Precursor Supply Link Graph', priority: 'HIGH', status: 'COMPLETED', dueDate: '26 Jul 2024', progress: 100, notes: 'Mapped connections between Jeedimetla factory and Mumbai buyers.' }
      ]
    },
    {
      id: 'off-4',
      name: 'Director General A. Sen',
      role: 'ADMIN',
      status: 'AVAILABLE',
      assignedTasks: 3,
      completedTasks: 3,
      assignedTasksCount: 3,
      completedTasksCount: 3,
      lastActive: '4h ago',
      lastActivity: '4h ago',
      contribution: 'Central Drug Standard Control Organisation (CDSCO) license cancellation and prosecution sanction.',
      deliverables: [
        { id: 'del-n8', title: 'Final Prosecution Sanction & Manufacturing License Revocation', priority: 'URGENT', status: 'COMPLETED', dueDate: '29 Jul 2024', progress: 100, notes: 'Signed statutory sanction for prosecution in Special NDPS Court.' }
      ]
    }
  ]
};

// Global default fallbacks if needed
export const mockEntities = caseDatasets['NDPS-118/2024'].entities;
export const mockRelationships = caseDatasets['NDPS-118/2024'].relationships;
export const mockAlerts = caseDatasets['NDPS-118/2024'].alerts;
export const mockEvidenceSources = caseDatasets['NDPS-118/2024'].evidenceSources;
export const mockResolutionCandidates: EntityResolutionCandidate[] = [
  { 
    id: 'cand-1', 
    entityAId: 'ent-1',
    entityBId: 'ent-1-alias',
    recordA: { id: 'ent-1', name: 'Arjun Verma', type: 'PERSON', detail: 'Andheri East, Mumbai', source: 'Primary Database' }, 
    recordB: { id: 'ent-1-alias', name: 'Arjun V. Verma', type: 'PERSON', detail: 'Andheri East (Alias)', source: 'RTO Registry' }, 
    confidence: 96, 
    status: 'PENDING',
    matchReasons: ['Exact phone match (+91 98211-44122)', 'Address geographic proximity (<200m)', 'Jaro-Winkler string similarity 94%']
  },
  { 
    id: 'cand-2', 
    entityAId: 'ent-2',
    entityBId: 'ent-2-alias',
    recordA: { id: 'ent-2', name: 'Rohit Sinha', type: 'PERSON', detail: 'Bandra West, Mumbai', source: 'Primary Database' }, 
    recordB: { id: 'ent-2-alias', name: 'Rohit Kumar Sinha', type: 'PERSON', detail: 'Bandra West', source: 'Bank Record' }, 
    confidence: 91, 
    status: 'PENDING',
    matchReasons: ['Vehicle registration match (MH12 AB 1234)', 'Bank KYC identifier overlap', 'Name variant match']
  }
];
export const mockTasks = caseDatasets['NDPS-118/2024'].tasks;
export const mockOfficers: CaseOfficer[] = [
  { id: 'off-1', name: 'Cmdr. V. R. Sharma', role: 'Lead Investigator (IO-4091)', status: 'AVAILABLE', assignedTasksCount: 4, completedTasksCount: 3, lastActivity: '12m ago', contribution: 'Overall case command and inter-state liaison.' },
  { id: 'off-2', name: 'Priya Nair', role: 'Financial Crimes Specialist', status: 'IN_FIELD', assignedTasksCount: 5, completedTasksCount: 4, lastActivity: '45m ago', contribution: 'Hawala trail auditing and shell corporation mapping.' },
  { id: 'off-3', name: 'R. K. Deshmukh', role: 'Operations & Field Commander', status: 'AVAILABLE', assignedTasksCount: 3, completedTasksCount: 2, lastActivity: '2h ago', contribution: 'Raid planning and tactical apprehension.' },
  { id: 'off-4', name: 'Vikram Joshi', role: 'Cyber & SIGINT Analyst', status: 'IN_FIELD', assignedTasksCount: 4, completedTasksCount: 3, lastActivity: '1h ago', contribution: 'CDR analysis and digital forensics.' }
];
export const mockRelatedCases = caseDatasets['NDPS-118/2024'].relatedCases;
export const mockInvestigationGroups: InvestigationGroup[] = [
  { groupId: 'grp-1', groupName: 'Western India Syndicated Crime Taskforce', relatedCasesCount: 5, stats: { people: 32, vehicles: 14, locations: 18, organizations: 9 } }
];
export const mockRoadmapSteps = caseDatasets['NDPS-118/2024'].roadmapSteps;
export const mockAuditLogs: AuditLogEntry[] = [
  { id: 'log-1', timestamp: '2026-08-23 01:14:22', user: 'Cmdr. V. R. Sharma (IO-4091)', action: 'Opened Case Dossier', resource: 'NDPS-118/2024', result: 'AUTHORIZED' },
  { id: 'log-2', timestamp: '2026-08-23 01:10:05', user: 'Priya Nair', action: 'Accessed Bank Transaction Record', resource: 'FIU-TXN-88234', result: 'AUTHORIZED' }
];

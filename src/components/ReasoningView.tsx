import React, { useState } from 'react';
import { 
  ShieldAlert, 
  HelpCircle, 
  GitBranch, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  Plus, 
  FileText, 
  ArrowUpRight, 
  Check, 
  X, 
  RefreshCw,
  Search,
  Sliders,
  TrendingUp,
  Layers,
  Shield,
  Activity,
  Zap,
  Lock
} from 'lucide-react';
import { Entity, Relationship, EvidenceSource, CaseTask } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface ReasoningViewProps {
  entities: Entity[];
  relationships: Relationship[];
  evidenceSources: EvidenceSource[];
  activeCaseNumber: string;
  onAddTask: (task: CaseTask) => void;
  onNavigateTab?: (tab: string) => void;
}

interface Hypothesis {
  id: string;
  title: string;
  description: string;
  supportScore: number;
  supportingEvidenceCount: number;
  contradictingEvidenceCount: number;
  independentSourcesCount: number;
  strongestEvidence: string;
  strongestContradiction: string;
  nextVerificationStep: string;
  status: 'ACTIVE' | 'SUPPORTED' | 'DISPROVED';
}

interface ContradictionItem {
  id: string;
  title: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  entitiesInvolved: string[];
  sourceA: string;
  sourceB: string;
  conflictingFields: string;
  explanation: string;
  status: 'OPEN' | 'REVIEWING' | 'RESOLVED' | 'DISMISSED';
}

interface EvidenceGapItem {
  id: string;
  expectedSignal: string;
  observedSignal: string;
  missingEvidence: string;
  whyItMatters: string;
  confidence: number;
  suggestedAction: string;
  status: 'PENDING' | 'VERIFYING' | 'RESOLVED';
}

interface FindingSimulation {
  id: string;
  statement: string;
  baseConfidence: number;
  supportingSources: string[];
  independentCategories: number;
  minSupportingSet: string[];
  removedSources: string[];
}

export const ReasoningView: React.FC<ReasoningViewProps> = ({ 
  entities, 
  relationships, 
  evidenceSources, 
  activeCaseNumber,
  onAddTask,
  onNavigateTab
}) => {
  const { t } = useLanguage();
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'resilience' | 'hypotheses' | 'contradictions' | 'gaps' | 'ledger' | 'verify'>('overview');
  
  // State for hypotheses
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([
    {
      id: 'hyp-1',
      title: 'Vikram Malhotra is the Inter-State Syndicate Logistics Coordinator',
      description: 'Centralizes narcotics procurement logistics and coordinates shell company fund transfers across state borders.',
      supportScore: 84,
      supportingEvidenceCount: 7,
      contradictingEvidenceCount: 1,
      independentSourcesCount: 4,
      strongestEvidence: 'CDR analysis E-014 showing direct call frequency with all regional couriers prior to shipments.',
      strongestContradiction: 'Alibi statement from witness placing him in Pune on 14 March (partially contested by toll cam E-022).',
      nextVerificationStep: 'Acquire financial KYC records for shell entities associated with Malhotra Brothers Trading.',
      status: 'SUPPORTED',
    },
    {
      id: 'hyp-2',
      title: 'Syndicate operates through Decentralized Cellular Cells without Single Mastermind',
      description: 'Operations are compartmentalized into autonomous courier and financial laundering units with minimal cross-communication.',
      supportScore: 58,
      supportingEvidenceCount: 4,
      contradictingEvidenceCount: 3,
      independentSourcesCount: 2,
      strongestEvidence: 'Absence of direct communication links between financial launderers and frontline narcotics couriers in E-031.',
      strongestContradiction: 'Bank wire transfer records linking all accounts back to a single primary holding account in E-044.',
      nextVerificationStep: 'Review wire transfer intermediary routing logs.',
      status: 'ACTIVE',
    },
    {
      id: 'hyp-3',
      title: 'Vehicle MH-12-DE-8891 is a Decoy Asset used to Divert Surveillance',
      description: 'Registered to a defunct transport firm, frequently parked near high-profile locations while secondary untracked vehicles execute deliveries.',
      supportScore: 72,
      supportingEvidenceCount: 5,
      contradictingEvidenceCount: 0,
      independentSourcesCount: 3,
      strongestEvidence: 'RTO registry shows mismatched chassis registration and dormant corporate status (E-019).',
      strongestContradiction: 'None currently recorded.',
      nextVerificationStep: 'Deploy ANPR camera log check for vehicle transit timestamps.',
      status: 'ACTIVE',
    }
  ]);

  // Contradictions state
  const [contradictions, setContradictions] = useState<ContradictionItem[]>([
    {
      id: 'contra-1',
      title: 'Location Temporal Discrepancy for Target Asset',
      severity: 'HIGH',
      entitiesInvolved: ['Vikram Malhotra', 'Hotel Taj Gateway Location'],
      sourceA: 'E-014 (Tower Triangulation CDR)',
      sourceB: 'E-022 (Field Surveillance Log)',
      conflictingFields: 'Timestamp overlap at 14:30 on 12 Mar 2026',
      explanation: 'CDR tower ping places phone in South Mumbai while field log records visual sighting in Thane.',
      status: 'OPEN',
    },
    {
      id: 'contra-2',
      title: 'Corporate Registration Status Inconsistency',
      severity: 'MEDIUM',
      entitiesInvolved: ['Malhotra Brothers Trading', 'Apex Logistics Corp'],
      sourceA: 'E-019 (RTO Registry Database)',
      sourceB: 'E-027 (Company Registrar Filings)',
      conflictingFields: 'Director Identification Number (DIN) mismatch',
      explanation: 'Registrar filings list inactive status while banking transactions show active inward wire receipts.',
      status: 'REVIEWING',
    }
  ]);

  // Evidence Gaps state
  const [evidenceGaps, setEvidenceGaps] = useState<EvidenceGapItem[]>([
    {
      id: 'gap-1',
      expectedSignal: 'Frequent telephonic communication between courier cell and logistics controller before shipments.',
      observedSignal: '14-day silence window prior to major transit dates (March 1 - March 14).',
      missingEvidence: 'Encrypted messaging or secondary burner phone CDR logs.',
      whyItMatters: 'Indicates use of secondary uncaptured communication channels (e.g., encrypted VoIP apps).',
      confidence: 89,
      suggestedAction: 'Obtain court order for device forensic extraction of seized smartphones.',
      status: 'PENDING',
    },
    {
      id: 'gap-2',
      expectedSignal: 'Direct financial trail linking retail distributor payments to wholesale procurement accounts.',
      observedSignal: 'Cash handoffs suspected but unverified by bank statements.',
      missingEvidence: 'CCTV footage from bank ATM vestibules during cash withdrawal times.',
      whyItMatters: 'Cash transactions obscure the proceeds of crime trail.',
      confidence: 76,
      suggestedAction: 'Request CCTV footage from commercial establishments adjacent to primary cash drop locations.',
      status: 'PENDING',
    }
  ]);

  // Proof & Resilience Simulation State
  const [findings, setFindings] = useState<FindingSimulation[]>([
    {
      id: 'find-1',
      statement: 'Vikram Malhotra coordinates inter-state narcotics logistics.',
      baseConfidence: 84,
      supportingSources: ['E-014', 'E-022', 'E-031', 'E-044'],
      independentCategories: 3,
      minSupportingSet: ['E-014', 'E-022'],
      removedSources: [],
    },
    {
      id: 'find-2',
      statement: 'Vehicle MH-12-DE-8891 is operated as a decoy asset.',
      baseConfidence: 76,
      supportingSources: ['E-019', 'E-027'],
      independentCategories: 2,
      minSupportingSet: ['E-019', 'E-027'],
      removedSources: [],
    }
  ]);

  const [newHypTitle, setNewHypTitle] = useState('');
  const [newHypDesc, setNewHypDesc] = useState('');
  const [showHypModal, setShowHypModal] = useState(false);

  // Handle adding hypothesis
  const handleCreateHypothesis = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHypTitle.trim()) return;
    const h: Hypothesis = {
      id: `hyp-${Date.now()}`,
      title: newHypTitle,
      description: newHypDesc || 'Investigator formulated alternate premise.',
      supportScore: 50,
      supportingEvidenceCount: 2,
      contradictingEvidenceCount: 0,
      independentSourcesCount: 1,
      strongestEvidence: 'Initial investigator observation.',
      strongestContradiction: 'None recorded.',
      nextVerificationStep: 'Gather supporting source files.',
      status: 'ACTIVE',
    };
    setHypotheses([h, ...hypotheses]);
    setNewHypTitle('');
    setNewHypDesc('');
    setShowHypModal(false);
  };

  // Handle task creation from Verify Next
  const handleCreateTaskFromVerify = (actionTitle: string) => {
    const newTask: CaseTask = {
      id: `task-${Date.now()}`,
      title: actionTitle,
      description: 'Generated from CHAKRA Verify Next uncertainty-reduction engine.',
      assignedOfficer: 'Lead Investigator',
      status: 'TODO',
      priority: 'HIGH',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdDate: new Date().toISOString().split('T')[0],
    };
    onAddTask(newTask);
    alert('Task successfully created and added to Case Tasks.');
  };

  // Toggle source removal in resilience test
  const toggleSourceRemoval = (findingId: string, sourceId: string) => {
    setFindings(prev => prev.map(f => {
      if (f.id !== findingId) return f;
      const alreadyRemoved = f.removedSources.includes(sourceId);
      const updatedRemoved = alreadyRemoved 
        ? f.removedSources.filter(s => s !== sourceId)
        : [...f.removedSources, sourceId];
      return { ...f, removedSources: updatedRemoved };
    }));
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0A0A0B] overflow-y-auto text-slate-300 font-sans">
      {/* Top Header Bar */}
      <div className="bg-[#111218] border-b border-white/5 px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <div className="flex items-center space-x-2 text-[11px] font-mono text-cyan-400 mb-1">
            <Sliders className="w-3.5 h-3.5" />
            <span>CHAKRA EVIDENCE REASONING & RESILIENCE ENGINE</span>
          </div>
          <h1 className="text-lg font-semibold text-white tracking-tight">Investigative Reasoning & Evidence Proof</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Evaluate evidence provenance, test conclusion robustness against source removal, resolve contradictions, and reduce uncertainty.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowHypModal(true)}
            className="flex items-center space-x-2 px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-semibold rounded transition shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Hypothesis</span>
          </button>
        </div>
      </div>

      {/* Scrollable Sub-Tab Navigation (Never clipped or overflowing) */}
      <div className="bg-[#0F1015] border-b border-white/5 px-6 py-2.5 overflow-x-auto shrink-0 flex items-center space-x-2 scrollbar-none">
        {[
          { id: 'overview', label: 'Reasoning Overview', icon: Activity },
          { id: 'resilience', label: 'Proof & Resilience Lab', icon: Lock, badge: 'SIGNATURE' },
          { id: 'hypotheses', label: `Hypothesis Lab (${hypotheses.length})`, icon: GitBranch },
          { id: 'contradictions', label: `Contradictions (${contradictions.length})`, icon: ShieldAlert },
          { id: 'gaps', label: `Evidence Gaps (${evidenceGaps.length})`, icon: HelpCircle },
          { id: 'ledger', label: 'Confidence Ledger', icon: TrendingUp },
          { id: 'verify', label: 'Verify Next', icon: CheckCircle2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.15)] font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="text-[9px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-1 py-0.2 rounded">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">

        {/* 1. REASONING OVERVIEW LANDING PAGE */}
        {activeSubTab === 'overview' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Top Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-[#12131A] border border-white/5 rounded-lg p-4 space-y-2">
                <div className="text-[11px] font-mono text-slate-400 uppercase">Evidence Health</div>
                <div className="text-2xl font-bold text-white font-mono">76%</div>
                <div className="text-xs text-emerald-400">High corroboration across 4 sources</div>
              </div>
              <div className="bg-[#12131A] border border-white/5 rounded-lg p-4 space-y-2">
                <div className="text-[11px] font-mono text-slate-400 uppercase">Open Contradictions</div>
                <div className="text-2xl font-bold text-amber-400 font-mono">{contradictions.length}</div>
                <div className="text-xs text-slate-400">Requires investigator verification</div>
              </div>
              <div className="bg-[#12131A] border border-white/5 rounded-lg p-4 space-y-2">
                <div className="text-[11px] font-mono text-slate-400 uppercase">Unresolved Gaps</div>
                <div className="text-2xl font-bold text-purple-400 font-mono">{evidenceGaps.length}</div>
                <div className="text-xs text-slate-400">Timeline and signal gaps</div>
              </div>
              <div className="bg-[#12131A] border border-white/5 rounded-lg p-4 space-y-2">
                <div className="text-[11px] font-mono text-slate-400 uppercase">Active Hypotheses</div>
                <div className="text-2xl font-bold text-cyan-400 font-mono">{hypotheses.length}</div>
                <div className="text-xs text-slate-400">Competing explanations tested</div>
              </div>
            </div>

            {/* Workflow Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* What We Know vs What Is Uncertain */}
              <div className="bg-[#12131A] border border-white/5 rounded-lg p-5 space-y-4">
                <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>What We Know (Directly Supported)</span>
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded space-y-1">
                    <div className="font-semibold text-white">Central Coordination Hub</div>
                    <p className="text-slate-400">Vikram Malhotra maintains direct communication links with regional couriers prior to transit dates (Supported by E-014, E-031).</p>
                  </div>
                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded space-y-1">
                    <div className="font-semibold text-white">Corporate Layering</div>
                    <p className="text-slate-400">Malhotra Brothers Trading exhibits dormant RTO status while receiving inward wire receipts.</p>
                  </div>
                </div>
              </div>

              {/* What Conflicts & What To Verify */}
              <div className="bg-[#12131A] border border-white/5 rounded-lg p-5 space-y-4">
                <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>What Conflicts & Requires Review</span>
                </h3>
                <div className="space-y-3 text-xs">
                  {contradictions.map(c => (
                    <div key={c.id} className="p-3 bg-amber-500/5 border border-amber-500/20 rounded space-y-1">
                      <div className="font-semibold text-amber-300 flex justify-between">
                        <span>{c.title}</span>
                        <span className="font-mono text-[10px]">{c.severity}</span>
                      </div>
                      <p className="text-slate-400">{c.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Signature Feature Callout */}
            <div className="bg-gradient-to-r from-cyan-950/40 via-[#12131A] to-[#12131A] border border-cyan-500/30 rounded-lg p-6 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="space-y-1">
                <div className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">CHAKRA Signature Capability</div>
                <h3 className="text-base font-semibold text-white">Proof & Resilience Lab</h3>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  Test whether your conclusions collapse if a key evidence source is discredited. Simulate source removal and compute minimum supporting evidence sets.
                </p>
              </div>
              <button
                onClick={() => setActiveSubTab('resilience')}
                className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-semibold rounded transition shadow-sm cursor-pointer whitespace-nowrap"
              >
                Open Resilience Lab →
              </button>
            </div>
          </div>
        )}

        {/* 2. PROOF & RESILIENCE LAB (SIGNATURE FEATURE) */}
        {activeSubTab === 'resilience' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-[#12131A] border border-white/5 rounded-lg p-5 space-y-2">
              <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider">Defensible Reasoning & Robustness Testing</div>
              <h2 className="text-base font-semibold text-white">Proof & Resilience Analysis</h2>
              <p className="text-xs text-slate-400">
                Traditional tools show who is connected. CHAKRA evaluates whether findings survive evidence removal. Test robustness by disabling sources below.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {findings.map((finding) => {
                // Calculate adjusted confidence based on removed sources
                const removedCount = finding.removedSources.length;
                const penalty = removedCount * 22;
                const currentConfidence = Math.max(15, finding.baseConfidence - penalty);
                const isRobust = currentConfidence >= 60 && !finding.removedSources.includes('E-014');

                return (
                  <div key={finding.id} className="bg-[#12131A] border border-white/5 rounded-lg p-6 space-y-5">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                      <div>
                        <div className="text-[10px] font-mono text-slate-500 mb-1">FINDING ID: {finding.id}</div>
                        <h3 className="text-base font-semibold text-white">{finding.statement}</h3>
                      </div>
                      <div className="flex items-center space-x-4 bg-black/40 px-4 py-2.5 rounded-lg border border-white/5">
                        <div className="text-right">
                          <div className="text-[10px] font-mono text-slate-400">Adjusted Confidence</div>
                          <div className={`text-lg font-bold font-mono ${isRobust ? 'text-cyan-400' : 'text-amber-400'}`}>
                            {currentConfidence}%
                          </div>
                        </div>
                        <div className="h-6 w-px bg-white/10" />
                        <div>
                          <div className="text-[10px] font-mono text-slate-400">Resilience Status</div>
                          <div className={`text-xs font-mono font-bold px-2 py-0.5 rounded uppercase ${
                            isRobust ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}>
                            {isRobust ? 'ROBUST' : 'VULNERABLE'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div className="bg-white/[0.02] p-3.5 rounded border border-white/5 space-y-1">
                        <div className="text-slate-500 font-mono">Independent Source Categories</div>
                        <div className="text-white font-bold">{finding.independentCategories} Categories ({finding.supportingSources.join(', ')})</div>
                      </div>
                      <div className="bg-white/[0.02] p-3.5 rounded border border-white/5 space-y-1">
                        <div className="text-slate-500 font-mono">Minimum Supporting Evidence Set</div>
                        <div className="text-cyan-300 font-bold font-mono">{finding.minSupportingSet.join(' + ')}</div>
                      </div>
                      <div className="bg-white/[0.02] p-3.5 rounded border border-white/5 space-y-1">
                        <div className="text-slate-500 font-mono">Single-Source Dependency</div>
                        <div className="text-emerald-400 font-bold">{removedCount === 0 ? 'Low (Multi-source corroborated)' : 'High (Compromised by removal)'}</div>
                      </div>
                    </div>

                    {/* Source Toggle Simulation Box */}
                    <div className="pt-3 border-t border-white/5 space-y-3">
                      <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">Simulate Evidence Discreditation (Click to Toggle Source):</div>
                      <div className="flex flex-wrap gap-2">
                        {finding.supportingSources.map(srcId => {
                          const isRemoved = finding.removedSources.includes(srcId);
                          return (
                            <button
                              key={srcId}
                              onClick={() => toggleSourceRemoval(finding.id, srcId)}
                              className={`px-3 py-1.5 rounded text-xs font-mono flex items-center space-x-2 transition cursor-pointer ${
                                isRemoved
                                  ? 'bg-red-500/20 text-red-300 border border-red-500/40 line-through'
                                  : 'bg-white/5 hover:bg-white/10 text-cyan-300 border border-white/10'
                              }`}
                            >
                              <span>Source {srcId}</span>
                              <span className="text-[10px]">{isRemoved ? '(Removed)' : '(Active)'}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. HYPOTHESIS LAB */}
        {activeSubTab === 'hypotheses' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">Competing Explanations & Evidence Matrix</h2>
              <span className="text-xs text-slate-400">{hypotheses.length} active working hypotheses</span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {hypotheses.map((hyp) => (
                <div key={hyp.id} className="bg-[#12131A] border border-white/5 rounded-lg p-5 space-y-4">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 uppercase">
                          {hyp.status}
                        </span>
                        <span className="text-xs font-mono text-slate-500">ID: {hyp.id}</span>
                      </div>
                      <h3 className="text-base font-semibold text-white">{hyp.title}</h3>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-xs font-mono text-slate-400">Support Score</div>
                        <div className="text-lg font-bold text-cyan-400 font-mono">{hyp.supportScore}%</div>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{hyp.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-white/5 text-xs">
                    <div className="bg-white/[0.02] p-3 rounded border border-white/5">
                      <div className="text-slate-500 font-mono mb-1">Supporting Evidence ({hyp.supportingEvidenceCount})</div>
                      <div className="text-slate-200">{hyp.strongestEvidence}</div>
                    </div>
                    <div className="bg-white/[0.02] p-3 rounded border border-white/5">
                      <div className="text-slate-500 font-mono mb-1">Contradicting Records</div>
                      <div className="text-amber-400/90">{hyp.strongestContradiction}</div>
                    </div>
                    <div className="bg-white/[0.02] p-3 rounded border border-white/5">
                      <div className="text-slate-500 font-mono mb-1">Recommended Next Step</div>
                      <div className="text-cyan-300">{hyp.nextVerificationStep}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. CONTRADICTIONS */}
        {activeSubTab === 'contradictions' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">Source Discrepancies & Conflicting Records</h2>
              <span className="text-xs text-slate-400">{contradictions.length} active discrepancies</span>
            </div>

            <div className="space-y-3">
              {contradictions.map((contra) => (
                <div key={contra.id} className="bg-[#12131A] border border-white/5 rounded-lg p-5 space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        contra.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border-red-500/40' :
                        contra.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' :
                        'bg-blue-500/20 text-blue-400 border-blue-500/40'
                      }`}>
                        {contra.severity} SEVERITY
                      </span>
                      <h3 className="text-sm font-semibold text-white">{contra.title}</h3>
                    </div>
                    <span className="text-xs font-mono text-slate-400">Status: {contra.status}</span>
                  </div>

                  <p className="text-xs text-slate-300">{contra.explanation}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-black/30 p-3 rounded border border-white/5 font-mono">
                    <div><span className="text-slate-500">Source A:</span> <span className="text-slate-300">{contra.sourceA}</span></div>
                    <div><span className="text-slate-500">Source B:</span> <span className="text-slate-300">{contra.sourceB}</span></div>
                    <div className="md:col-span-2"><span className="text-slate-500">Conflicting Field:</span> <span className="text-amber-300">{contra.conflictingFields}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. EVIDENCE GAPS */}
        {activeSubTab === 'gaps' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">Negative-Space Analysis & Evidence Gaps</h2>
              <span className="text-xs text-slate-400">Missing expected intelligence signals</span>
            </div>

            <div className="space-y-3">
              {evidenceGaps.map((gap) => (
                <div key={gap.id} className="bg-[#12131A] border border-white/5 rounded-lg p-5 space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30">
                        GAP CONFIDENCE: {gap.confidence}%
                      </span>
                      <h3 className="text-sm font-semibold text-white">Missing Expected Signal</h3>
                    </div>
                    <span className="text-xs font-mono text-slate-400">Priority: High</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-white/[0.02] p-3 rounded border border-white/5 space-y-1">
                      <div className="text-slate-500 font-mono">Expected Signal</div>
                      <div className="text-slate-200">{gap.expectedSignal}</div>
                    </div>
                    <div className="bg-white/[0.02] p-3 rounded border border-white/5 space-y-1">
                      <div className="text-slate-500 font-mono">Observed Reality</div>
                      <div className="text-amber-300">{gap.observedSignal}</div>
                    </div>
                  </div>

                  <div className="text-xs bg-cyan-500/5 border border-cyan-500/20 p-3 rounded space-y-1">
                    <div className="text-cyan-400 font-mono font-medium">Investigative Significance & Action:</div>
                    <div className="text-slate-300">{gap.whyItMatters} Recommended Action: <span className="text-white font-medium">{gap.suggestedAction}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. CONFIDENCE LEDGER */}
        {activeSubTab === 'ledger' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">Case-Level Confidence Ledger</h2>
              <span className="text-xs text-slate-400">Transparent scoring breakdown</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#12131A] border border-white/5 rounded-lg p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono text-slate-400 uppercase">Entity Identity Confidence</span>
                  <span className="text-lg font-bold text-cyan-400 font-mono">88%</span>
                </div>
                <p className="text-xs text-slate-300">Based on multi-source attribute matching across RTO registry, PAN verification, and biometric ID records.</p>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-cyan-500 h-full w-[88%]" />
                </div>
              </div>

              <div className="bg-[#12131A] border border-white/5 rounded-lg p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono text-slate-400 uppercase">Relationship Confidence</span>
                  <span className="text-lg font-bold text-emerald-400 font-mono">79%</span>
                </div>
                <p className="text-xs text-slate-300">Supported by 3 independent source categories (CDR tower pings, bank wire transfers, and eyewitness surveillance).</p>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[79%]" />
                </div>
              </div>

              <div className="bg-[#12131A] border border-white/5 rounded-lg p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono text-slate-400 uppercase">Timeline Sequence Confidence</span>
                  <span className="text-lg font-bold text-amber-400 font-mono">68%</span>
                </div>
                <p className="text-xs text-slate-300">Two unexplained 14-day timeline gaps identified where corroborating movement records are missing.</p>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full w-[68%]" />
                </div>
              </div>

              <div className="bg-[#12131A] border border-white/5 rounded-lg p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono text-slate-400 uppercase">Overall Investigative Confidence</span>
                  <span className="text-lg font-bold text-cyan-400 font-mono">78%</span>
                </div>
                <p className="text-xs text-slate-300">Aggregate composite rating reflecting high identity resolution with moderate temporal uncertainty.</p>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-full w-[78%]" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 7. VERIFY NEXT */}
        {activeSubTab === 'verify' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">Next Best Verification Actions</h2>
              <span className="text-xs text-slate-400">Ranked by maximum uncertainty reduction</span>
            </div>

            <div className="space-y-3">
              {[
                {
                  title: 'Confirm whether phone identifier +91-98211-55412 and entity Vikram Malhotra refer to the same individual',
                  impact: 'High Information Gain',
                  priority: 'URGENT',
                  reason: 'Resolves primary communication attribution ambiguity.',
                },
                {
                  title: 'Review source coverage for the 14-day timeline gap (March 1 - March 14)',
                  impact: 'Medium Information Gain',
                  priority: 'HIGH',
                  reason: 'Fills critical movement sequence gap in suspect timeline.',
                },
                {
                  title: 'Validate whether corporate shell entities share registered office addresses',
                  impact: 'High Information Gain',
                  priority: 'MEDIUM',
                  reason: 'Strengthens financial syndicate network cluster verification.',
                },
              ].map((action, idx) => (
                <div key={idx} className="bg-[#12131A] border border-white/5 rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                        {action.priority}
                      </span>
                      <span className="text-xs font-mono text-cyan-400">{action.impact}</span>
                    </div>
                    <h4 className="text-sm font-medium text-white">{action.title}</h4>
                    <p className="text-xs text-slate-400">{action.reason}</p>
                  </div>
                  <button 
                    onClick={() => handleCreateTaskFromVerify(action.title)}
                    className="px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-semibold rounded transition shrink-0 cursor-pointer shadow-sm"
                  >
                    Create Task
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* New Hypothesis Modal */}
      {showHypModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#12131A] border border-white/10 rounded-lg max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-base font-semibold text-white">Formulate Competing Hypothesis</h3>
              <button onClick={() => setShowHypModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateHypothesis} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-400">Hypothesis Title</label>
                <input
                  type="text"
                  value={newHypTitle}
                  onChange={(e) => setNewHypTitle(e.target.value)}
                  placeholder="e.g. Primary coordinator is operating through intermediary..."
                  className="w-full bg-[#0A0A0B] border border-white/10 rounded px-3 py-2 text-xs text-white focus:border-cyan-500 outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-400">Analytical Description</label>
                <textarea
                  value={newHypDesc}
                  onChange={(e) => setNewHypDesc(e.target.value)}
                  placeholder="Describe operational premise and supporting observations..."
                  rows={3}
                  className="w-full bg-[#0A0A0B] border border-white/10 rounded px-3 py-2 text-xs text-white focus:border-cyan-500 outline-none resize-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowHypModal(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-xs text-slate-300 rounded transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-xs font-semibold text-slate-950 rounded transition cursor-pointer"
                >
                  Add to Lab
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

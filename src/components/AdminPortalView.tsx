import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  Lock, 
  Key, 
  Database, 
  Activity, 
  FileText, 
  CheckCircle2, 
  AlertTriangle,
  RotateCcw,
  UserCheck,
  Fingerprint,
  Radio,
  Cpu,
  RefreshCw,
  Server,
  AlertCircle
} from 'lucide-react';
import { AuditLogEntry, UserRole, GraphValidationResult } from '../types';
import { useAuth, availableOfficers } from '../context/AuthContext';
import { useIntelligence } from '../context/IntelligenceContext';
import { validateCaseGraph } from '../utils/networkAnalysis';
import { caseDatasets } from '../data/mockData';

interface AdminPortalViewProps {
  auditLogs?: AuditLogEntry[];
}

export const AdminPortalView: React.FC<AdminPortalViewProps> = () => {
  const { currentUser, switchOfficer, setUserRole } = useAuth();
  const { auditLogs, resetToDefaultData, activeCase, caseDataMap, allCases } = useIntelligence();
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'roles' | 'security' | 'diagnostics' | 'audit' | 'reset'>('users');
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Backend & Graph Health State
  const [backendHealth, setBackendHealth] = useState<{ status: string; aiEnabled?: boolean; model?: string; timestamp?: string } | null>(null);
  const [isCheckingBackend, setIsCheckingBackend] = useState(false);
  const [graphDiagnostics, setGraphDiagnostics] = useState<Record<string, GraphValidationResult>>({});
  const [diagnosticsLastRun, setDiagnosticsLastRun] = useState<string>('');

  const runAllDiagnostics = () => {
    setIsCheckingBackend(true);
    // 1. Backend health check
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setBackendHealth(data))
      .catch(err => setBackendHealth({ status: 'OFFLINE', aiEnabled: false, model: 'Offline rule-based fallback' }))
      .finally(() => setIsCheckingBackend(false));

    // 2. Graph topology validation for all cases
    const results: Record<string, GraphValidationResult> = {};
    allCases.forEach(c => {
      const data = caseDataMap[c.caseNumber] || caseDatasets[c.caseNumber];
      if (data) {
        results[c.caseNumber] = validateCaseGraph(data.entities || [], data.relationships || []);
      }
    });
    setGraphDiagnostics(results);
    setDiagnosticsLastRun(new Date().toLocaleTimeString());
  };

  useEffect(() => {
    runAllDiagnostics();
  }, [caseDataMap]);

  const handleReset = () => {
    resetToDefaultData();
    setResetConfirmOpen(false);
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 3000);
  };

  return (
    <div className="flex-1 bg-[#0A0A0B] p-8 text-slate-300 overflow-y-auto font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2.5">
              <Shield className="w-6 h-6 text-cyan-400" />
              <span>Administration, RBAC & Security Audit</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Role-Based Access Control (RBAC), user directory, system security posture, graph diagnostics, and live audit logs.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-3 py-1 rounded text-xs font-mono font-bold flex items-center space-x-1.5">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Current User: {currentUser.name} ({currentUser.role})</span>
            </span>
          </div>
        </div>

        {/* Sub Navigation */}
        <div className="flex space-x-2 mb-6 font-mono text-xs overflow-x-auto pb-1">
          {[
            { id: 'users', label: 'Officer Directory & Switcher', icon: Users },
            { id: 'roles', label: 'Roles & RBAC Matrix', icon: Key },
            { id: 'security', label: 'Security Center', icon: Shield },
            { id: 'diagnostics', label: 'Diagnostics & Graph Health', icon: Cpu },
            { id: 'audit', label: `Audit Trail (${auditLogs.length})`, icon: Activity },
            { id: 'reset', label: 'Demo Reset Control', icon: RotateCcw }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-lg flex items-center space-x-2 transition-all cursor-pointer whitespace-nowrap ${
                  isActive ? 'bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-500/30' : 'bg-[#0F0F12] text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Officer Directory & Active Account Switcher */}
        {activeSubTab === 'users' && (
          <div className="space-y-6 font-mono">
            <div className="bg-[#0F0F12] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">Authorized Officer Accounts</h2>
                  <p className="text-xs text-slate-400 mt-1">Switch officer identity to test role-based enforcement across modules.</p>
                </div>
              </div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-[#0A0A0B] text-[10px] text-slate-500 uppercase">
                    <th className="p-4">Officer Name</th>
                    <th className="p-4">Badge / Department</th>
                    <th className="p-4">Assigned Role</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Switch Active Session</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {availableOfficers.map(u => {
                    const isCurrent = currentUser.id === u.id;
                    return (
                      <tr key={u.id} className={`hover:bg-white/5 transition-colors ${isCurrent ? 'bg-cyan-500/5' : ''}`}>
                        <td className="p-4 font-bold text-white">
                          <div className="flex items-center space-x-2">
                            <span>{u.name}</span>
                            {isCurrent && (
                              <span className="text-[9px] bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-1.5 py-0.2 rounded">
                                ACTIVE
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-slate-400">
                          <div className="text-slate-200">{u.badgeNumber}</div>
                          <div className="text-[10px] text-slate-500">{u.department}</div>
                        </td>
                        <td className="p-4 text-cyan-400 font-bold">{u.role}</td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                            {u.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {isCurrent ? (
                            <span className="text-slate-500 text-xs">Current Officer</span>
                          ) : (
                            <button
                              onClick={() => switchOfficer(u.id)}
                              className="bg-[#1A1A1F] hover:bg-cyan-500 hover:text-black text-slate-200 border border-white/10 px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                            >
                              Switch to this Officer
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Roles & RBAC Matrix */}
        {activeSubTab === 'roles' && (
          <div className="space-y-6 font-mono text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { role: 'ADMIN', level: 'Level 5 (Full Access)', desc: 'Full administrative control over user accounts, RBAC policies, security audit logs, and graph database reset.' },
                { role: 'LEAD_INVESTIGATOR', level: 'Level 4 (Case Controller)', desc: 'Case oversight, AI extraction approvals, entity resolution merging, task assignments, and evidence audit.' },
                { role: 'INVESTIGATOR', level: 'Level 3 (Operational)', desc: 'Intelligence ingestion, entity candidate resolution, task completion, and report compilation.' },
                { role: 'ANALYST', level: 'Level 2 (Intelligence)', desc: 'Link graph analysis, AI network topology assessment, translation, and shortest-path calculation.' },
                { role: 'VIEWER', level: 'Level 1 (Read-Only)', desc: 'Authorized read-only viewing of dossiers, link graphs, and generated intelligence reports.' }
              ].map(r => (
                <div key={r.role} className="bg-[#0F0F12] border border-white/10 rounded-xl p-6 shadow-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold text-white">{r.role}</span>
                      <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded font-bold">
                        {r.level}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-sans leading-relaxed">{r.desc}</p>
                  </div>
                  <div className="mt-6 pt-3 border-t border-white/5 text-[10px] text-slate-500">
                    Enforced at state and handler boundaries.
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Security Center */}
        {activeSubTab === 'security' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
            <div className="bg-[#0F0F12] border border-white/10 rounded-xl p-6 shadow-xl space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white pb-3 border-b border-white/10">
                System Security Posture
              </h2>
              {[
                { label: 'Authentication & Session Isolation', status: 'ACTIVE', color: 'text-emerald-400' },
                { label: 'Role-Based Access Control (RBAC)', status: 'ACTIVE', color: 'text-emerald-400' },
                { label: 'Server-Side Gemini AI Gateway', status: 'SECURED', color: 'text-emerald-400' },
                { label: 'Audit Logging & Provenance Tracking', status: 'ACTIVE', color: 'text-emerald-400' },
                { label: 'Sensitive Identifier Masking Guidelines', status: 'ACTIVE', color: 'text-emerald-400' },
                { label: 'Session State Persistence', status: 'ACTIVE', color: 'text-emerald-400' }
              ].map(sec => (
                <div key={sec.label} className="flex items-center justify-between bg-[#1A1A1F] border border-white/5 p-3 rounded">
                  <span className="text-slate-300">{sec.label}</span>
                  <span className={`font-bold ${sec.color}`}>{sec.status}</span>
                </div>
              ))}
            </div>

            <div className="bg-[#0F0F12] border border-white/10 rounded-xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-white pb-3 border-b border-white/10 mb-4">
                  Law Enforcement Intelligence Standards
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed font-sans mb-4">
                  "CHAKRA operates strictly on synthetic demo intelligence datasets. In production deployment, all intelligence records, CDR intercepts, and entity resolutions are subject to strict evidentiary standards, departmental approvals, and statutory compliance."
                </p>
              </div>
              <div className="bg-[#1A1A1F] border border-white/5 rounded p-3 text-[11px] text-cyan-400 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>All sensitive identifiers comply with privacy masking guidelines.</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: System Diagnostics & Graph Health */}
        {activeSubTab === 'diagnostics' && (
          <div className="space-y-6 font-mono text-xs">
            {/* Header & Trigger Controls */}
            <div className="bg-[#0F0F12] border border-white/10 rounded-xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span>CHAKRA Core System & Graph Topology Diagnostics</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1 font-sans">
                  Automated verification of graph integrity, dangling reference detection, connected component clustering, and backend AI gateway status.
                </p>
                {diagnosticsLastRun && (
                  <div className="text-[10px] text-slate-500 mt-1">
                    Last execution: {diagnosticsLastRun} · Schema Version: <span className="text-cyan-400">chakra_case_datasets_v3</span>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={runAllDiagnostics}
                disabled={isCheckingBackend}
                className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50 shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isCheckingBackend ? 'animate-spin' : ''}`} />
                <span>RUN GRAPH DIAGNOSTIC SUITE</span>
              </button>
            </div>

            {/* Backend AI Service Posture */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#0F0F12] border border-white/10 rounded-xl p-5 shadow-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 font-bold">AI Gateway Endpoint</span>
                  <Server className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-lg font-bold text-white">/api/health</div>
                <div className="mt-2 flex items-center space-x-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    backendHealth?.status === 'OK' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {backendHealth?.status === 'OK' ? 'ONLINE (ACTIVE)' : 'FALLBACK MODE'}
                  </span>
                </div>
              </div>

              <div className="bg-[#0F0F12] border border-white/10 rounded-xl p-5 shadow-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 font-bold">LLM Intelligence Model</span>
                  <Cpu className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-base font-bold text-purple-300">
                  {backendHealth?.model || 'gemini-3.7-flash'}
                </div>
                <div className="mt-2 text-[10px] text-slate-400">
                  {backendHealth?.aiEnabled ? 'Server-side API key verified' : 'Deterministic rule-based fallback ready'}
                </div>
              </div>

              <div className="bg-[#0F0F12] border border-white/10 rounded-xl p-5 shadow-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 font-bold">Local Graph Store</span>
                  <Database className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-lg font-bold text-emerald-300">v3 Schema</div>
                <div className="mt-2 text-[10px] text-slate-400">
                  {allCases.length} Canonical case databases loaded
                </div>
              </div>
            </div>

            {/* Case-by-Case Graph Topology Audit Results */}
            <div className="bg-[#0F0F12] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
              <div className="p-5 border-b border-white/10">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Case Link Graph Topology Audit</h3>
                <p className="text-xs text-slate-400 mt-0.5">Verification of entity uniqueness, edge validities, self-loop prevention, and connected components.</p>
              </div>
              <div className="divide-y divide-white/5">
                {allCases.map(c => {
                  const diag = graphDiagnostics[c.caseNumber];
                  if (!diag) return null;
                  const isHealthy = diag.isValid;
                  return (
                    <div key={c.caseNumber} className="p-5 hover:bg-white/5 transition-colors space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center space-x-3">
                          <span className={`w-2.5 h-2.5 rounded-full ${isHealthy ? 'bg-emerald-400' : 'bg-red-400'}`} />
                          <div>
                            <span className="font-bold text-white">{c.caseNumber}</span>
                            <span className="text-slate-400 ml-2 font-normal">— {c.title}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${
                            isHealthy ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}>
                            {isHealthy ? 'TOPOLOGY HEALTHY' : `${diag.errors.length} ERRORS DETECTED`}
                          </span>
                        </div>
                      </div>

                      {/* Metrics bar */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                        <div className="bg-[#141418] border border-white/5 p-2 rounded">
                          <div className="text-[10px] text-slate-500 uppercase">Entities</div>
                          <div className="text-sm font-bold text-white">{diag.entityCount} nodes</div>
                        </div>
                        <div className="bg-[#141418] border border-white/5 p-2 rounded">
                          <div className="text-[10px] text-slate-500 uppercase">Links</div>
                          <div className="text-sm font-bold text-white">{diag.relationshipCount} edges</div>
                        </div>
                        <div className="bg-[#141418] border border-white/5 p-2 rounded">
                          <div className="text-[10px] text-slate-500 uppercase">Components</div>
                          <div className="text-sm font-bold text-cyan-400">{diag.connectedComponents} clusters</div>
                        </div>
                        <div className="bg-[#141418] border border-white/5 p-2 rounded">
                          <div className="text-[10px] text-slate-500 uppercase">Isolated Nodes</div>
                          <div className={`text-sm font-bold ${(diag.details?.isolatedEntityCount ?? 0) > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
                            {diag.details?.isolatedEntityCount ?? 0}
                          </div>
                        </div>
                      </div>

                      {/* Warnings / Errors if any */}
                      {(diag.errors.length > 0 || diag.warnings.length > 0) && (
                        <div className="space-y-1.5 pt-1">
                          {diag.errors.map((err, idx) => (
                            <div key={idx} className="p-2 bg-red-500/10 border border-red-500/20 rounded flex items-center space-x-2 text-red-300 text-[11px]">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                              <span>{err}</span>
                            </div>
                          ))}
                          {diag.warnings.map((warn, idx) => (
                            <div key={idx} className="p-2 bg-amber-500/10 border border-amber-500/20 rounded flex items-center space-x-2 text-amber-300 text-[11px]">
                              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                              <span>{warn}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Live Audit Trail */}
        {activeSubTab === 'audit' && (
          <div className="bg-[#0F0F12] border border-white/10 rounded-xl p-6 shadow-xl font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                Live Security & Investigation Audit Trail
              </h2>
              <span className="text-xs text-slate-500">{auditLogs.length} Events Recorded</span>
            </div>
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {auditLogs.map(log => (
                <div key={log.id} className="bg-[#1A1A1F] border border-white/5 rounded-lg p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                    <div>
                      <div className="text-white font-bold">{log.action} <span className="text-cyan-400 font-normal">({log.resource})</span></div>
                      <div className="text-[11px] text-slate-400 mt-0.5">Actor: {log.user}</div>
                      {log.details && (
                        <div className="text-[10px] text-slate-500 mt-1">{log.details}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 shrink-0">
                    <span className="text-[10px] text-slate-500">{log.timestamp}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      log.result === 'AUTHORIZED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      log.result === 'RESTRICTED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                      'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {log.result}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Reset Demo Data */}
        {activeSubTab === 'reset' && (
          <div className="bg-[#0F0F12] border border-white/10 rounded-xl p-6 shadow-xl font-mono text-xs max-w-xl space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white pb-3 border-b border-white/10 flex items-center space-x-2">
              <RotateCcw className="w-4 h-4 text-amber-400" />
              <span>Reset Intelligence State to Verified Baseline</span>
            </h2>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              If you have imported multiple custom intelligence dumps or merged multiple entities and want to reset the demonstration database back to the pristine initial state, you can reset all cases with one click.
            </p>

            {resetSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-300 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Intelligence database successfully restored to default baseline.</span>
              </div>
            )}

            {!resetConfirmOpen ? (
              <button
                type="button"
                onClick={() => setResetConfirmOpen(true)}
                className="px-4 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg font-bold transition-all flex items-center space-x-2 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore Baseline Demo Intelligence</span>
              </button>
            ) : (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg space-y-3">
                <div className="text-xs text-red-300 font-bold flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Are you sure you want to reset all intelligence feeds?</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs cursor-pointer"
                  >
                    Yes, Reset Everything
                  </button>
                  <button
                    type="button"
                    onClick={() => setResetConfirmOpen(false)}
                    className="px-4 py-2 bg-[#1A1A1F] hover:bg-white/10 text-slate-300 rounded-lg text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

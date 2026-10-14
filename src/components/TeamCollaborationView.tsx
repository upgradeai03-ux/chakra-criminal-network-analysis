import React, { useState } from 'react';
import { Users, Shield, CheckCircle2, Clock, Activity, Award, Briefcase, X, FileCheck, AlertTriangle } from 'lucide-react';
import { CaseOfficer, AuditLogEntry, InvestigationCase, OfficerDeliverable } from '../types';

interface TeamCollaborationViewProps {
  activeCase?: InvestigationCase;
  officers: CaseOfficer[];
  auditLogs: AuditLogEntry[];
}

export const TeamCollaborationView: React.FC<TeamCollaborationViewProps> = ({
  activeCase,
  officers = [],
  auditLogs = []
}) => {
  const [selectedOfficerForDeliverables, setSelectedOfficerForDeliverables] = useState<CaseOfficer | null>(null);

  const safeOfficers = Array.isArray(officers) ? officers : [];
  const safeAuditLogs = Array.isArray(auditLogs) ? auditLogs : [];
  const currentCaseNum = activeCase?.caseNumber || 'Active Case';

  const handleOpenDeliverables = (officer: CaseOfficer) => {
    setSelectedOfficerForDeliverables(officer);
  };

  const handleCloseDeliverables = () => {
    setSelectedOfficerForDeliverables(null);
  };

  return (
    <div className="flex-1 bg-[#0A0A0B] p-8 text-slate-300 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-1">
            <span className="bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded">
              CASE TEAM CONTEXT: {currentCaseNum}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2.5">
            <Users className="w-6 h-6 text-cyan-400" />
            <span>Case Team & Officer Collaboration</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Assigned multi-disciplinary investigation personnel, operational roles, and recent activity audit trails.
          </p>
        </div>

        {/* Officers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {safeOfficers.map(officer => {
            const assigned = Number(officer.assignedTasks ?? officer.assignedTasksCount ?? 0);
            const completed = Number(officer.completedTasks ?? officer.completedTasksCount ?? 0);
            const completionRate = assigned > 0 ? Math.min(100, Math.round((completed / assigned) * 100)) : 0;
            const deliverablesCount = officer.deliverables ? officer.deliverables.length : 0;
            const lastActiveTime = officer.lastActive || officer.lastActivity || 'Active recently';

            return (
              <div key={officer.id || officer.name} className="bg-[#0F0F12] border border-white/10 rounded-xl p-6 shadow-xl flex flex-col justify-between hover:border-cyan-500/30 transition-all">
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded bg-[#1A1A1F] border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold font-mono text-base">
                        {officer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">{officer.name}</h3>
                        <p className="text-xs font-mono text-cyan-400">{officer.role}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold border ${
                      officer.status === 'AVAILABLE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      officer.status === 'IN_FIELD' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                      'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {officer.status || 'AVAILABLE'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 font-sans leading-relaxed mb-6">
                    {officer.contribution || 'Active investigator assigned to tactical execution and case intelligence synthesis.'}
                  </p>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5 font-mono text-xs">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-[#1A1A1F] border border-white/5 p-2 rounded">
                      <div className="text-[10px] text-slate-500 uppercase">Assigned Tasks</div>
                      <div className="text-sm font-bold text-white mt-0.5">{assigned}</div>
                    </div>
                    <div className="bg-[#1A1A1F] border border-white/5 p-2 rounded">
                      <div className="text-[10px] text-slate-500 uppercase">Completed</div>
                      <div className="text-sm font-bold text-emerald-400 mt-0.5">{completed}</div>
                    </div>
                    <div className="bg-[#1A1A1F] border border-white/5 p-2 rounded">
                      <div className="text-[10px] text-slate-500 uppercase">Success Rate</div>
                      <div className="text-sm font-bold text-cyan-400 mt-0.5">{completionRate}%</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Last active: {lastActiveTime}</span>
                    </span>
                    <button
                      onClick={() => handleOpenDeliverables(officer)}
                      className="text-cyan-400 hover:text-cyan-300 hover:underline flex items-center space-x-1 font-semibold cursor-pointer transition-colors"
                    >
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>View Assigned Deliverables ({deliverablesCount}) →</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Collaboration & Activity Audit Trail */}
        <div className="bg-[#0F0F12] border border-white/10 rounded-xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-200 flex items-center space-x-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Case Collaboration & Action Audit Log</span>
            </h2>
            <span className="text-[10px] font-mono text-slate-500">Secured & Encrypted Feed</span>
          </div>

          <div className="space-y-3 font-mono text-xs max-h-96 overflow-y-auto">
            {safeAuditLogs.map(log => (
              <div key={log.id} className="bg-[#1A1A1F] border border-white/5 rounded-lg p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                  <div>
                    <div className="text-white font-bold">{log.action} <span className="text-cyan-400 font-normal">({log.resource})</span></div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Operated by {log.user}</div>
                    {log.details && (
                      <div className="text-[10px] text-slate-500 font-sans mt-1">{log.details}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-4 self-end md:self-auto shrink-0">
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

        {/* Assigned Deliverables Modal */}
        {selectedOfficerForDeliverables && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-mono">
            <div className="bg-[#0F0F12] border border-cyan-500/30 rounded-xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[85vh] flex flex-col">
              <div className="flex items-start justify-between pb-4 border-b border-white/10 mb-4">
                <div>
                  <div className="flex items-center space-x-2 text-xs text-cyan-400 mb-1">
                    <span className="bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded font-bold">
                      CASE: {currentCaseNum}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400">{selectedOfficerForDeliverables.role}</span>
                  </div>
                  <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                    <Briefcase className="w-5 h-5 text-cyan-400" />
                    <span>Assigned Deliverables: {selectedOfficerForDeliverables.name}</span>
                  </h2>
                </div>
                <button
                  onClick={handleCloseDeliverables}
                  className="p-1.5 rounded bg-[#1A1A1F] hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto space-y-4 pr-1 flex-1">
                {(!selectedOfficerForDeliverables.deliverables || selectedOfficerForDeliverables.deliverables.length === 0) ? (
                  <div className="bg-[#1A1A1F] border border-white/5 rounded-lg p-8 text-center">
                    <FileCheck className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-300">No Pending Deliverables</p>
                    <p className="text-xs text-slate-500 mt-1">All primary deliverables for {selectedOfficerForDeliverables.name} on case {currentCaseNum} have been filed.</p>
                  </div>
                ) : (
                  selectedOfficerForDeliverables.deliverables.map(del => {
                    const progress = del.progress ?? 0;
                    return (
                      <div key={del.id} className="bg-[#1A1A1F] border border-white/5 rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className={`text-[9px] px-2 py-0.5 rounded font-bold border ${
                                del.priority === 'URGENT' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                del.priority === 'HIGH' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                'bg-blue-500/10 text-blue-400 border-blue-500/20'
                              }`}>
                                {del.priority}
                              </span>
                              <span className={`text-[9px] px-2 py-0.5 rounded font-bold border ${
                                del.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                del.status === 'IN_PROGRESS' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                                'bg-slate-500/10 text-slate-400 border-slate-500/20'
                              }`}>
                                {del.status.replace('_', ' ')}
                              </span>
                            </div>
                            <h3 className="text-sm font-bold text-white font-sans">{del.title}</h3>
                          </div>
                          <span className="text-[11px] text-slate-400 shrink-0">
                            Due: <strong className="text-white">{del.dueDate}</strong>
                          </span>
                        </div>

                        {del.notes && (
                          <p className="text-xs text-slate-400 font-sans leading-relaxed bg-[#141418] p-2.5 rounded border border-white/5">
                            {del.notes}
                          </p>
                        )}

                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-slate-400">
                            <span>Completion Progress</span>
                            <span className="text-cyan-400 font-bold">{progress}%</span>
                          </div>
                          <div className="w-full bg-[#0A0A0B] h-1.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-500 ${
                                progress === 100 ? 'bg-emerald-400' : 'bg-cyan-400'
                              }`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-white/10 flex justify-end">
                <button
                  onClick={handleCloseDeliverables}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded text-xs cursor-pointer"
                >
                  Close Deliverables
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

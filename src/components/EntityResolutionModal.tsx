import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Check, X, ShieldCheck, Merge, Info, ArrowRight } from 'lucide-react';
import { EntityResolutionCandidate } from '../types';
import { useIntelligence } from '../context/IntelligenceContext';
import { useAuth } from '../context/AuthContext';

interface EntityResolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EntityResolutionModal: React.FC<EntityResolutionModalProps> = ({ isOpen, onClose }) => {
  const { resolutionCandidates, confirmEntityResolution, rejectEntityResolution, activeCase } = useIntelligence();
  const { canResolveEntities } = useAuth();
  const [resolvedStatusMap, setResolvedStatusMap] = useState<Record<string, 'CONFIRMED' | 'REJECTED'>>({});
  const [activeTab, setActiveTab] = useState<'PENDING' | 'RESOLVED'>('PENDING');

  if (!isOpen) return null;

  const handleConfirm = (candidate: EntityResolutionCandidate) => {
    confirmEntityResolution(candidate.id);
    setResolvedStatusMap(prev => ({ ...prev, [candidate.id]: 'CONFIRMED' }));
  };

  const handleReject = (candidate: EntityResolutionCandidate) => {
    rejectEntityResolution(candidate.id);
    setResolvedStatusMap(prev => ({ ...prev, [candidate.id]: 'REJECTED' }));
  };

  const pendingCandidates = resolutionCandidates.filter(c => !resolvedStatusMap[c.id]);
  const resolvedCandidates = resolutionCandidates.filter(c => resolvedStatusMap[c.id]);

  const displayCandidates = activeTab === 'PENDING' ? pendingCandidates : resolvedCandidates;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4 font-sans">
      <div className="bg-[#0F0F12] border border-white/10 rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-mono font-bold text-white tracking-wide">
                  AI ENTITY RESOLUTION & DEDUPLICATION
                </h2>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {activeCase.caseNumber}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Weighted similarity pipeline: compares phone, vehicle registration, name variants, & addresses
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-500 hover:text-white p-1 rounded transition-colors text-xs font-mono"
          >
            ✕ CLOSE
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center space-x-2 mb-4">
          <button
            onClick={() => setActiveTab('PENDING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors ${
              activeTab === 'PENDING'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-white bg-[#141418]'
            }`}
          >
            PENDING CANDIDATES ({pendingCandidates.length})
          </button>
          <button
            onClick={() => setActiveTab('RESOLVED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors ${
              activeTab === 'RESOLVED'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white bg-[#141418]'
            }`}
          >
            RESOLVED IN SESSION ({resolvedCandidates.length})
          </button>
        </div>

        {!canResolveEntities && (
          <div className="p-3 mb-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center space-x-3 text-amber-300 text-xs font-mono">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Viewer role is active. Switch officer role to Lead Investigator or Administrator to merge entities.</span>
          </div>
        )}

        {/* List of Candidates */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-4">
          {displayCandidates.length === 0 ? (
            <div className="p-12 text-center bg-[#141418] border border-white/5 rounded-xl">
              <CheckCircle2 className="w-10 h-10 text-emerald-400/60 mx-auto mb-3" />
              <div className="text-sm font-semibold text-white font-mono">
                {activeTab === 'PENDING'
                  ? 'All Candidate Entities are Resolved'
                  : 'No Candidates Resolved in Current Session'}
              </div>
              <p className="text-xs text-slate-400 font-mono mt-1 max-w-sm mx-auto">
                {activeTab === 'PENDING'
                  ? 'No high-confidence duplicate entities detected in the current intelligence graph.'
                  : 'Resolved match decisions will appear here.'}
              </p>
            </div>
          ) : (
            displayCandidates.map((candidate) => {
              const currentStatus = resolvedStatusMap[candidate.id] || candidate.status;
              return (
                <div
                  key={candidate.id}
                  className="bg-[#141418] border border-white/10 hover:border-white/20 rounded-xl p-4 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-md">
                        Match Confidence: {candidate.confidence}%
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                          currentStatus === 'CONFIRMED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : currentStatus === 'REJECTED'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                        }`}
                      >
                        {currentStatus}
                      </span>
                    </div>

                    {currentStatus === 'PENDING' && canResolveEntities && (
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => handleConfirm(candidate)}
                          className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
                        >
                          <Merge className="w-3.5 h-3.5" />
                          <span>CONFIRM & MERGE</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReject(candidate)}
                          className="bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>REJECT MATCH</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Side by side records */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    {/* Record A */}
                    <div className="bg-[#0A0A0B] p-3 rounded-lg border border-white/5">
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-1">
                        <span>RECORD A (CANONICAL)</span>
                        <span className="text-cyan-400">{candidate.recordA.source}</span>
                      </div>
                      <div className="text-sm font-bold text-white">{candidate.recordA.name}</div>
                      <div className="text-xs text-slate-400 font-mono mt-1">
                        {candidate.recordA.detail}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        Type: {candidate.recordA.type} · ID: {candidate.recordA.id}
                      </div>
                    </div>

                    {/* Record B */}
                    <div className="bg-[#0A0A0B] p-3 rounded-lg border border-white/5">
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-1">
                        <span>RECORD B (CANDIDATE)</span>
                        <span className="text-purple-400">{candidate.recordB.source}</span>
                      </div>
                      <div className="text-sm font-bold text-white">{candidate.recordB.name}</div>
                      <div className="text-xs text-slate-400 font-mono mt-1">
                        {candidate.recordB.detail}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        Type: {candidate.recordB.type} · ID: {candidate.recordB.id}
                      </div>
                    </div>
                  </div>

                  {/* Match Factors Breakdown */}
                  <div className="bg-[#0A0A0B]/50 p-2.5 rounded-lg border border-white/5">
                    <div className="text-[10px] font-mono text-slate-400 font-semibold mb-1 flex items-center space-x-1">
                      <Info className="w-3 h-3 text-cyan-400" />
                      <span>TRANSPARENT MATCH FACTORS:</span>
                    </div>
                    <ul className="space-y-1">
                      {candidate.matchReasons.map((reason, idx) => (
                        <li key={idx} className="text-[11px] font-mono text-slate-300 flex items-center space-x-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-white/10 mt-4 flex justify-between items-center text-xs font-mono text-slate-400">
          <div>
            <span>Merging entities re-wires all connected edges and retains source provenance.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg text-xs font-mono transition-all cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.3)]"
          >
            DONE
          </button>
        </div>
      </div>
    </div>
  );
};

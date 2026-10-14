import React, { useState } from 'react';
import { FileStack, CheckCircle2, ExternalLink, ShieldAlert, Search } from 'lucide-react';
import { EvidenceSource } from '../types';

interface EvidenceViewProps {
  evidenceSources: EvidenceSource[];
}

export const EvidenceView: React.FC<EvidenceViewProps> = ({ evidenceSources }) => {
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceSource | null>(null);

  return (
    <div className="flex-1 bg-[#0A0A0B] p-8 text-slate-300 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Evidence & Source Ledger</h1>
            <p className="text-xs text-slate-400 mt-1 font-mono">Verifiable intelligence sources tied to every network relationship and entity.</p>
          </div>
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded text-xs font-mono font-bold flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>100% Traceable</span>
          </span>
        </div>

        <div className="space-y-4">
          {evidenceSources.map(ev => (
            <div
              key={ev.id}
              onClick={() => setSelectedEvidence(ev)}
              className="bg-[#0F0F12] hover:bg-white/5 border border-white/10 rounded-xl p-6 cursor-pointer transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded bg-[#1A1A1F] border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                  <FileStack className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2.5 mb-1">
                    <span className="text-[10px] font-mono bg-[#1A1A1F] text-slate-300 px-2 py-0.5 rounded border border-white/5">
                      {ev.type}
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400">{ev.referenceId}</span>
                    <span className="text-[10px] font-mono text-slate-500">{ev.timestamp}</span>
                  </div>
                  <h3 className="text-base font-bold text-white">{ev.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed font-mono">{ev.summary}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 shrink-0">
                <div className="text-right">
                  <div className="text-[10px] font-mono text-slate-500">Confidence</div>
                  <div className="text-sm font-mono font-bold text-emerald-400">{ev.confidence}%</div>
                </div>
                <div className="bg-[#1A1A1F] border border-white/10 px-3 py-1.5 rounded text-xs font-mono text-slate-300 flex items-center space-x-1">
                  <span>View Source</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Evidence Detail Modal */}
        {selectedEvidence && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#0F0F12] border border-white/10 rounded-xl max-w-lg w-full p-6 shadow-2xl relative">
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                <h3 className="text-xs font-mono font-bold text-cyan-400">{selectedEvidence.referenceId}</h3>
                <button
                  onClick={() => setSelectedEvidence(null)}
                  className="text-slate-400 hover:text-white text-xs font-mono"
                >
                  ✕ CLOSE
                </button>
              </div>
              <h2 className="text-lg font-bold text-white mb-2">{selectedEvidence.title}</h2>
              <p className="text-xs text-slate-400 leading-relaxed mb-6 font-mono">{selectedEvidence.summary}</p>

              <div className="bg-[#1A1A1F] border border-white/5 rounded-lg p-4 space-y-3 text-xs font-mono mb-6">
                <div className="flex justify-between">
                  <span className="text-slate-500">Verification Status:</span>
                  <span className="text-emerald-400 font-bold">Verified Law Enforcement Record</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Confidence Score:</span>
                  <span className="text-cyan-400">{selectedEvidence.confidence}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Timestamp:</span>
                  <span className="text-slate-300">{selectedEvidence.timestamp}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedEvidence(null)}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-2.5 rounded text-xs transition-all font-mono"
              >
                CLOSE EVIDENCE DOSSIER
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

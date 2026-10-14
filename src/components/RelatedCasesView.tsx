import React, { useState } from 'react';
import { GitMerge, Link2, ShieldCheck, ExternalLink, CheckCircle2, AlertCircle, Layers, Unlink, Network } from 'lucide-react';
import { RelatedCase, InvestigationGroup, InvestigationCase } from '../types';

interface RelatedCasesViewProps {
  activeCase?: InvestigationCase;
  relatedCases?: RelatedCase[];
  investigationGroups?: InvestigationGroup[];
  onToggleLinkCase: (caseId: string) => void;
}

export const RelatedCasesView: React.FC<RelatedCasesViewProps> = ({
  activeCase,
  relatedCases = [],
  investigationGroups = [],
  onToggleLinkCase
}) => {
  const [selectedCaseForLink, setSelectedCaseForLink] = useState<RelatedCase | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const safeRelatedCases = Array.isArray(relatedCases) ? relatedCases : [];
  const safeGroups = Array.isArray(investigationGroups) ? investigationGroups : [];

  const handlePromptLink = (rc: RelatedCase) => {
    setSelectedCaseForLink(rc);
    setShowConfirmModal(true);
  };

  const handleConfirmLink = () => {
    if (selectedCaseForLink) {
      onToggleLinkCase(selectedCaseForLink.id);
      setShowConfirmModal(false);
      setSelectedCaseForLink(null);
    }
  };

  const currentCaseNum = activeCase?.caseNumber || 'Active Case';

  return (
    <div className="flex-1 bg-[#0A0A0B] p-8 text-slate-300 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-1">
            <span className="bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded">
              CURRENT CONTEXT: {currentCaseNum}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2.5">
            <GitMerge className="w-6 h-6 text-cyan-400" />
            <span>Case Clubbing & Related Investigations</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Cross-case correlation engine identifying overlapping entities, shared phone numbers, vehicles, and syndicate clusters.
          </p>
        </div>

        {/* Investigation Groups Banner */}
        {safeGroups.length > 0 && (
          <div className="space-y-4 mb-8">
            {safeGroups.map(group => {
              const stats = group.stats || { people: 0, vehicles: 0, locations: 0, organizations: 0 };
              return (
                <div key={group.groupId || group.groupName} className="bg-gradient-to-r from-cyan-950/40 via-[#0F0F12] to-[#0F0F12] border border-cyan-500/30 rounded-xl p-6 shadow-xl">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2.5 py-1 rounded">
                        INVESTIGATION CLUSTER GROUP
                      </span>
                      <h2 className="text-lg font-bold text-white mt-2">{group.groupName}</h2>
                      <p className="text-xs text-slate-400 font-mono mt-1">
                        Encompassing {group.relatedCasesCount ?? 0} active inter-state investigations with consolidated intelligence mapping.
                      </p>
                    </div>

                    <div className="grid grid-cols-4 gap-3 text-center font-mono">
                      <div className="bg-[#1A1A1F] border border-white/10 p-2.5 rounded">
                        <div className="text-[9px] text-slate-500 uppercase">People</div>
                        <div className="text-base font-bold text-white">{stats.people ?? 0}</div>
                      </div>
                      <div className="bg-[#1A1A1F] border border-white/10 p-2.5 rounded">
                        <div className="text-[9px] text-slate-500 uppercase">Vehicles</div>
                        <div className="text-base font-bold text-cyan-400">{stats.vehicles ?? 0}</div>
                      </div>
                      <div className="bg-[#1A1A1F] border border-white/10 p-2.5 rounded">
                        <div className="text-[9px] text-slate-500 uppercase">Locations</div>
                        <div className="text-base font-bold text-amber-400">{stats.locations ?? 0}</div>
                      </div>
                      <div className="bg-[#1A1A1F] border border-white/10 p-2.5 rounded">
                        <div className="text-[9px] text-slate-500 uppercase">Orgs</div>
                        <div className="text-base font-bold text-purple-400">{stats.organizations ?? 0}</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Related Cases List */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-200 flex items-center space-x-2">
            <Network className="w-4 h-4 text-cyan-400" />
            <span>Correlated Cases for {currentCaseNum} ({safeRelatedCases.length})</span>
          </h2>
          <span className="text-[11px] font-mono text-slate-500">
            {safeRelatedCases.filter(r => r.linked).length} Linked to Current Investigation
          </span>
        </div>

        {safeRelatedCases.length === 0 ? (
          <div className="bg-[#0F0F12] border border-white/10 rounded-xl p-12 text-center">
            <Layers className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-300 font-mono">No Correlated Cases Found</h3>
            <p className="text-xs text-slate-500 mt-1 font-mono">
              The correlation engine has not identified cross-case entity overlaps for case {currentCaseNum} at this time.
            </p>
          </div>
        ) : (
          <div className="space-y-4 font-mono">
            {safeRelatedCases.map(rc => {
              const sharedEnt = rc.sharedEntities ?? 0;
              const sharedLoc = rc.sharedLocations ?? 0;
              const sharedRel = rc.sharedRelationships ?? 0;
              const conf = rc.confidence ?? 80;
              const isLinked = Boolean(rc.linked);

              return (
                <div 
                  key={rc.id} 
                  className={`bg-[#0F0F12] border ${isLinked ? 'border-emerald-500/40 bg-emerald-950/10' : 'border-white/10'} rounded-xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded bg-[#1A1A1F] border ${isLinked ? 'border-emerald-500/40 text-emerald-400' : 'border-cyan-500/30 text-cyan-400'} flex items-center justify-center shrink-0`}>
                      <Layers className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="text-[10px] bg-white/5 text-slate-300 px-2 py-0.5 rounded border border-white/5 font-semibold">
                          {rc.category || 'GENERAL'}
                        </span>
                        <span className="text-xs text-cyan-400 font-bold">{rc.caseNumber}</span>
                        {rc.year && (
                          <span className="text-[10px] text-slate-500">({rc.year})</span>
                        )}
                        {rc.priority && (
                          <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold border ${
                            rc.priority === 'CRITICAL' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                            rc.priority === 'HIGH' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          }`}>
                            {rc.priority} PRIORITY
                          </span>
                        )}
                        {isLinked && (
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded flex items-center space-x-1 font-bold">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>OFFICIALLY CLUBBED</span>
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-white">{rc.title}</h3>

                      {rc.relationReason && (
                        <p className="text-xs text-slate-400 font-sans mt-2 leading-relaxed bg-[#141418] border border-white/5 p-2.5 rounded">
                          <strong className="text-cyan-300 font-mono">Correlation Vector:</strong> {rc.relationReason}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-3">
                        <span>Shared Entities: <strong className="text-white">{sharedEnt}</strong></span>
                        <span>Shared Locations: <strong className="text-white">{sharedLoc}</strong></span>
                        <span>Shared Relationships: <strong className="text-white">{sharedRel}</strong></span>
                        <span>AI Confidence: <strong className="text-cyan-400">{conf}%</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 self-end md:self-auto shrink-0">
                    <button
                      onClick={() => handlePromptLink(rc)}
                      className={`px-4 py-2.5 rounded text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
                        isLinked 
                          ? 'bg-[#1A1A1F] hover:bg-red-500/10 text-slate-300 hover:text-red-300 border border-white/10 hover:border-red-500/30' 
                          : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-lg shadow-cyan-500/20'
                      }`}
                    >
                      {isLinked ? <Unlink className="w-3.5 h-3.5 text-red-400" /> : <Link2 className="w-3.5 h-3.5" />}
                      <span>{isLinked ? 'UNLINK / SEPARATE' : 'CLUB WITH THIS CASE'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Confirmation Modal for Linking Cases */}
        {showConfirmModal && selectedCaseForLink && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-mono">
            <div className="bg-[#0F0F12] border border-white/10 rounded-xl max-w-md w-full p-6 shadow-2xl relative">
              <div className="flex items-center space-x-3 mb-4 text-cyan-400">
                <AlertCircle className="w-6 h-6" />
                <h3 className="text-base font-bold text-white">
                  {selectedCaseForLink.linked ? 'Detach Linked Investigation' : 'Authorize Case Clubbing'}
                </h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-6 font-sans">
                {selectedCaseForLink.linked ? (
                  <>
                    You are about to sever the intelligence link between <strong className="text-white font-mono">{currentCaseNum}</strong> and <strong className="text-white font-mono">{selectedCaseForLink.caseNumber}</strong> ({selectedCaseForLink.title}).
                  </>
                ) : (
                  <>
                    You are about to establish an official intelligence link between <strong className="text-white font-mono">{currentCaseNum}</strong> and <strong className="text-white font-mono">{selectedCaseForLink.caseNumber}</strong> ({selectedCaseForLink.title}). This will merge shared entity graphs while maintaining strict departmental audit logs.
                  </>
                )}
              </p>
              <div className="bg-[#1A1A1F] border border-white/5 rounded p-3 text-xs mb-6 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Confidence Score:</span>
                  <span className="text-cyan-400">{selectedCaseForLink.confidence ?? 80}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Shared Identifiers:</span>
                  <span className="text-white">
                    {selectedCaseForLink.sharedEntities ?? 0} Entities, {selectedCaseForLink.sharedLocations ?? 0} Locations
                  </span>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 rounded bg-[#1A1A1F] hover:bg-white/5 text-slate-300 text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmLink}
                  className={`px-4 py-2 rounded font-bold text-xs cursor-pointer ${
                    selectedCaseForLink.linked
                      ? 'bg-red-500 hover:bg-red-400 text-white'
                      : 'bg-cyan-500 hover:bg-cyan-400 text-black'
                  }`}
                >
                  {selectedCaseForLink.linked ? 'Confirm Unlink' : 'Confirm & Link Cases'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

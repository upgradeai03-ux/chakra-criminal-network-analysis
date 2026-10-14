import React from 'react';
import { Cpu, CheckCircle2, Clock, ArrowRight, Play, ExternalLink } from 'lucide-react';
import { RoadmapStep, InvestigationCase } from '../types';

interface AiRoadmapViewProps {
  activeCase: InvestigationCase;
  roadmapSteps: RoadmapStep[];
  onUpdateStepStatus: (stepId: string, status: RoadmapStep['status']) => void;
  onNavigateModule: (module: RoadmapStep['targetModule']) => void;
}

export const AiRoadmapView: React.FC<AiRoadmapViewProps> = ({
  activeCase,
  roadmapSteps,
  onUpdateStepStatus,
  onNavigateModule
}) => {
  const completedSteps = roadmapSteps.filter(s => s.status === 'COMPLETED').length;
  const progressPercent = Math.round((completedSteps / roadmapSteps.length) * 100);

  const getStatusBadge = (status: RoadmapStep['status']) => {
    switch (status) {
      case 'COMPLETED': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'IN_PROGRESS': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'BLOCKED': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'NOT_STARTED': return 'bg-[#1A1A1F] text-slate-400 border-white/5';
    }
  };

  return (
    <div className="flex-1 bg-[#0A0A0B] p-8 text-slate-300 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2.5 py-1 rounded">
                AI ANALYTICAL WORKFLOW ENGINE
              </span>
              <span className="text-xs font-mono text-slate-400">Case: {activeCase.caseNumber}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Investigation Roadmap & Flowchart</h1>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              AI-generated analytical procedure tailored for {activeCase.category.toLowerCase()} investigations. Click any step to open the corresponding module.
            </p>
          </div>
          <div className="bg-[#0F0F12] border border-white/10 rounded-xl p-4 text-right font-mono min-w-[200px]">
            <div className="text-[10px] text-slate-500 uppercase">CASE PROGRESS</div>
            <div className="text-lg font-bold text-cyan-400 mt-0.5">{completedSteps} / {roadmapSteps.length} Steps ({progressPercent}%)</div>
            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-2">
              <div className="bg-cyan-400 h-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </div>

        {/* Roadmap Steps Flowchart */}
        <div className="space-y-4 font-mono">
          {roadmapSteps.map((step, index) => (
            <div key={step.stepId} className="bg-[#0F0F12] border border-white/10 rounded-xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
              {index < roadmapSteps.length - 1 && (
                <div className="hidden md:block absolute left-9 -bottom-4 w-0.5 h-4 bg-cyan-500/30 z-0" />
              )}
              
              <div className="flex items-start space-x-4 z-10">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                  step.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                  step.status === 'IN_PROGRESS' ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' :
                  'bg-[#1A1A1F] text-slate-400 border-white/10'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-[10px] bg-white/5 text-slate-400 px-2 py-0.5 rounded border border-white/5">
                      {step.category}
                    </span>
                    <select
                      value={step.status}
                      onChange={(e) => onUpdateStepStatus(step.stepId, e.target.value as any)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border focus:outline-none ${getStatusBadge(step.status)}`}
                    >
                      <option value="NOT_STARTED">NOT STARTED</option>
                      <option value="IN_PROGRESS">IN PROGRESS</option>
                      <option value="BLOCKED">BLOCKED</option>
                      <option value="COMPLETED">COMPLETED</option>
                    </select>
                  </div>
                  <h3 className="text-base font-bold text-white">{step.title}</h3>
                  <p className="text-xs text-slate-400 font-sans mt-1 leading-relaxed">{step.description}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 self-end md:self-auto z-10">
                <button
                  onClick={() => onNavigateModule(step.targetModule)}
                  className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-4 py-2 rounded text-xs font-mono font-bold flex items-center space-x-2 transition-all"
                >
                  <span>Open {step.targetModule.toUpperCase()}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

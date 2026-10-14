import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Users, 
  AlertTriangle, 
  BellRing, 
  FileStack, 
  ArrowUpRight, 
  Sparkles, 
  Network,
  Activity,
  CheckCircle2,
  Lock,
  ChevronRight,
  Briefcase
} from 'lucide-react';
import { Entity, AIAlert, InvestigationCase } from '../types';
import { NavTab } from './Sidebar';

interface OverviewDashboardProps {
  activeCase: InvestigationCase;
  entities: Entity[];
  alerts: AIAlert[];
  onSelectEntity: (entityId: string) => void;
  onNavigate: (tab: NavTab) => void;
  onRunDemoAnalysis: () => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  activeCase,
  entities,
  alerts,
  onSelectEntity,
  onNavigate,
  onRunDemoAnalysis
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);

  const steps = [
    'Extracting fragmented intelligence records...',
    'Resolving cross-source entity identities...',
    'Building weighted relationship vectors...',
    'Running graph centrality & community detection...',
    'Detecting communication & financial anomalies...',
    'Analysis complete. Intelligence ready.'
  ];

  const handleRunAnalysis = () => {
    setIsAnalyzing(true);
    setAnalysisStep(0);
    const interval = setInterval(() => {
      setAnalysisStep(prev => {
        if (prev < steps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            setIsAnalyzing(false);
            onRunDemoAnalysis();
          }, 800);
          return prev;
        }
      });
    }, 650);
  };

  const highRiskEntities = [...entities].sort((a, b) => b.riskScore - a.riskScore).slice(0, 5);

  return (
    <div className="flex-1 bg-[#0A0A0B] overflow-y-auto p-8 text-slate-300">
      {/* Top Banner / Hero */}
      <div className="bg-[#0F0F12] border border-white/10 rounded-xl p-8 mb-8 relative overflow-hidden shadow-2xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-3xl">
          <div className="flex items-center space-x-2.5 mb-3">
            <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-mono px-2.5 py-1 rounded">
              CASE: {activeCase.caseNumber}
            </span>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono px-2.5 py-1 rounded flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
              <span>{activeCase.status}</span>
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
            {activeCase.title}
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed mb-6 font-mono">
            {activeCase.description}
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={handleRunAnalysis}
              disabled={isAnalyzing}
              className="bg-cyan-600 hover:bg-cyan-500 text-black font-bold px-5 py-2.5 rounded text-xs uppercase tracking-widest flex items-center space-x-2 transition-all shadow-lg shadow-cyan-500/20 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-black" />
              <span>{isAnalyzing ? 'RUNNING AI ANALYSIS...' : '▶ RUN AI ANALYSIS'}</span>
            </button>

            <button
              onClick={() => onNavigate('network')}
              className="bg-[#1A1A1F] hover:bg-white/5 text-slate-200 border border-white/10 px-5 py-2.5 rounded text-xs font-medium flex items-center space-x-2 transition-all cursor-pointer font-mono"
            >
              <Network className="w-4 h-4 text-cyan-400" />
              <span>Open Network Graph Workspace</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>

          {/* Analysis Modal Progress Overlay */}
          {isAnalyzing && (
            <div className="mt-6 bg-[#0A0A0B] border border-cyan-500/40 rounded-xl p-4 animate-pulse">
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="text-cyan-400 flex items-center space-x-2">
                  <Activity className="w-4 h-4 animate-spin text-cyan-400" />
                  <span>CHAKRA INTELLIGENCE PIPELINE ACTIVE</span>
                </span>
                <span className="text-slate-400">Step {analysisStep + 1} of {steps.length}</span>
              </div>
              <div className="text-sm text-slate-200 font-mono">
                {steps[analysisStep]}
              </div>
              <div className="w-full bg-white/5 h-1.5 rounded-full mt-3 overflow-hidden">
                <div 
                  className="bg-cyan-500 h-full transition-all duration-300" 
                  style={{ width: `${((analysisStep + 1) / steps.length) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#0F0F12] border border-white/10 rounded-xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">ACTIVE INVESTIGATIONS</span>
            <Briefcase className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-bold text-white font-mono mt-3">01</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center space-x-1 font-mono">
            <span className="text-emerald-400 font-semibold">+1 new</span>
            <span>lead source updated</span>
          </div>
        </div>

        <div className="bg-[#0F0F12] border border-white/10 rounded-xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">ENTITIES ANALYZED</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-white font-mono mt-3">{entities.length}</div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            Across 6 distinct entity categories
          </div>
        </div>

        <div className="bg-[#0F0F12] border border-white/10 rounded-xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">HIGH-RISK ENTITIES</span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-3xl font-bold text-red-400 font-mono mt-3">
            {entities.filter(e => e.riskScore >= 80).length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            Requiring immediate investigative focus
          </div>
        </div>

        <div className="bg-[#0F0F12] border border-white/10 rounded-xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">ACTIVE AI ALERTS</span>
            <BellRing className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-bold text-amber-400 font-mono mt-3">{alerts.length}</div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            Anomaly detection triggers active
          </div>
        </div>
      </div>

      {/* Two Column Layout: Top Risk Entities & AI Alerts Ticker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: High-Risk Entities */}
        <div className="lg:col-span-2 bg-[#0F0F12] border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
            <div>
              <h2 className="text-xs font-bold tracking-widest uppercase text-slate-300">High-Risk Entity Watchlist</h2>
              <p className="text-[11px] text-slate-500 font-mono">Ranked by analytical priority and network centrality</p>
            </div>
            <button
              onClick={() => onNavigate('entities')}
              className="text-xs text-cyan-400 hover:underline flex items-center space-x-1 font-mono"
            >
              <span>View all entities</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {highRiskEntities.map(entity => (
              <div
                key={entity.id}
                onClick={() => {
                  onSelectEntity(entity.id);
                  onNavigate('network');
                }}
                className="bg-[#1A1A1F] hover:bg-white/5 border border-white/5 rounded-lg p-4 flex items-center justify-between cursor-pointer transition-all group"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded flex items-center justify-center font-mono font-bold text-sm ${
                    entity.type === 'PERSON' ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20' :
                    entity.type === 'PHONE' ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20' :
                    entity.type === 'VEHICLE' ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' :
                    'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                  }`}>
                    {entity.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold text-white group-hover:text-cyan-400 transition-colors">
                        {entity.name}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-400">
                        {entity.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      {entity.details.address || entity.details.phone || entity.details.vehicleNumber || 'No location details'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-[10px] font-mono text-slate-500 uppercase">Risk Score</div>
                    <div className={`text-sm font-mono font-bold ${
                      entity.riskScore >= 90 ? 'text-red-400' :
                      entity.riskScore >= 75 ? 'text-amber-400' : 'text-cyan-400'
                    }`}>
                      {entity.riskScore} / 100
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: AI Alerts Feed */}
        <div className="bg-[#0F0F12] border border-white/10 rounded-xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
            <div>
              <h2 className="text-xs font-bold tracking-widest uppercase text-slate-300">AI Anomaly Alerts</h2>
              <p className="text-[11px] text-slate-500 font-mono">Real-time pattern flags</p>
            </div>
            <button
              onClick={() => onNavigate('alerts')}
              className="text-xs text-cyan-400 hover:underline font-mono"
            >
              View all ({alerts.length})
            </button>
          </div>

          <div className="space-y-3 flex-1">
            {alerts.slice(0, 3).map(alert => (
              <div
                key={alert.id}
                onClick={() => onNavigate('alerts')}
                className="bg-[#1A1A1F] hover:bg-white/5 border border-white/5 rounded-lg p-3.5 cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    alert.priority === 'CRITICAL' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                    alert.priority === 'HIGH' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                  }`}>
                    {alert.priority}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">{alert.timestamp.slice(10)}</span>
                </div>
                <h3 className="text-xs font-semibold text-white mb-1">{alert.title}</h3>
                <p className="text-[11px] text-slate-400 font-mono line-clamp-2 leading-relaxed">{alert.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 text-center">
            <div className="text-[10px] text-slate-500 font-mono flex items-center justify-center space-x-1.5">
              <Lock className="w-3 h-3 text-slate-400" />
              <span>Secured Law Enforcement Intelligence Feed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

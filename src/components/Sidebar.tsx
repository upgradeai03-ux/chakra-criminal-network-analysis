import React from 'react';
import { 
  LayoutDashboard, 
  Briefcase, 
  Network, 
  Users, 
  BellRing, 
  BarChart3, 
  FileStack, 
  FileSpreadsheet,
  CheckSquare,
  GitMerge,
  Globe,
  Cpu,
  Languages,
  Shield,
  GitBranch
} from 'lucide-react';

export type NavTab = 
  | 'overview' 
  | 'investigations' 
  | 'network' 
  | 'reasoning'
  | 'tasks' 
  | 'team' 
  | 'related' 
  | 'heatmap' 
  | 'roadmap' 
  | 'entities' 
  | 'alerts' 
  | 'analytics' 
  | 'evidence' 
  | 'reports' 
  | 'translate' 
  | 'admin';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  unreadAlertsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, unreadAlertsCount }) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'investigations', label: 'Investigations', icon: Briefcase },
    { id: 'network', label: 'Interactive Network', icon: Network },
    { id: 'reasoning', label: 'Reasoning Engine', icon: GitBranch, badge: 'CORE' },
    { id: 'tasks', label: 'Case Tasks', icon: CheckSquare },
    { id: 'team', label: 'Case Team', icon: Users },
    { id: 'related', label: 'Related Cases', icon: GitMerge },
    { id: 'heatmap', label: 'Geographic Map', icon: Globe },
    { id: 'roadmap', label: 'AI Roadmap', icon: Cpu },
    { id: 'entities', label: 'Entities DB', icon: Users },
    { id: 'alerts', label: 'AI Alerts', icon: BellRing, count: unreadAlertsCount },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'evidence', label: 'Evidence & Sources', icon: FileStack },
    { id: 'reports', label: 'Report Generator', icon: FileSpreadsheet },
    { id: 'translate', label: 'CHAKRA Translate', icon: Languages },
    { id: 'admin', label: 'Administration', icon: Shield },
  ];

  return (
    <aside className="w-64 bg-[#0F0F12] border-r border-white/5 flex flex-col shrink-0 select-none">
      <div className="p-4 border-b border-white/5">
        <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1">
          OPERATIONAL MODULES
        </div>
        <div className="text-xs text-slate-300 font-medium">Case NDPS-118/2024 Workspace</div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id as NavTab)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded text-xs font-medium transition-all ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </div>
              
              {item.badge && (
                <span className="text-[9px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-1.5 py-0.5 rounded">
                  {item.badge}
                </span>
              )}

              {item.count !== undefined && item.count > 0 && (
                <span className="text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded-full">
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer System Status */}
      <div className="p-4 border-t border-white/5 bg-[#0A0A0B]/50">
        <div className="flex items-center justify-between text-[11px] font-mono mb-2">
          <span className="text-slate-400 flex items-center space-x-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>AI ENGINE</span>
          </span>
          <span className="text-emerald-400 font-semibold">ONLINE</span>
        </div>
        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
          <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full w-[94%]" />
        </div>
        <div className="flex justify-between items-center text-[10px] text-slate-600 font-mono mt-1">
          <span>Model: Gemini 2.4 Pro</span>
          <span>99.4% Acc</span>
        </div>
      </div>
    </aside>
  );
};

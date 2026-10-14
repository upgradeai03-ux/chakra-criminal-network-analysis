import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Filter, 
  Search, 
  ShieldAlert, 
  Cpu, 
  Layers, 
  ChevronRight,
  User,
  Phone,
  Car,
  MapPin,
  Building2,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Minimize2,
  ChevronLeft,
  GitCommit,
  Route,
  Sparkles,
  RefreshCw,
  FileCheck,
  Split,
  Eye,
  X,
  Share2,
  Compass
} from 'lucide-react';
import { Entity, Relationship, EntityType, ShortestPathResult } from '../types';
import { useIntelligence } from '../context/IntelligenceContext';
import { useAuth } from '../context/AuthContext';

interface InvestigationWorkspaceProps {
  entities: Entity[];
  relationships: Relationship[];
  selectedEntityId: string | null;
  onSelectEntity: (id: string) => void;
}

export const InvestigationWorkspace: React.FC<InvestigationWorkspaceProps> = ({
  entities,
  relationships,
  selectedEntityId,
  onSelectEntity
}) => {
  const {
    activeCase,
    findPathBetween,
    highlightedPath,
    setHighlightedPath,
    runAiNetworkAnalysis,
    networkReport,
    isAnalyzingNetwork,
    aiBackendEnabled,
  } = useIntelligence();

  const { canRunAiAnalysis } = useAuth();

  const [zoomLevel, setZoomLevel] = useState(1);
  const [activeFilterType, setActiveFilterType] = useState<EntityType | 'ALL'>('ALL');
  const [minRisk, setMinRisk] = useState<number>(0);
  const [graphSearch, setGraphSearch] = useState('');
  
  // Resizable Dossier & Fullscreen states
  const [dossierWidth, setDossierWidth] = useState<number>(380);
  const [isDossierCollapsed, setIsDossierCollapsed] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isDraggingDossier, setIsDraggingDossier] = useState<boolean>(false);

  // Shortest Path Finder state
  const [pathSourceId, setPathSourceId] = useState<string>('');
  const [pathTargetId, setPathTargetId] = useState<string>('');
  const [pathFinderOpen, setPathFinderOpen] = useState<boolean>(false);

  // AI Analysis Modal / Drawer state
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState<boolean>(false);

  // Node Dragging on Canvas State
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({});
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Initialize node positions from entity coordinates
  useEffect(() => {
    const pos: Record<string, { x: number; y: number }> = {};
    entities.forEach((e, idx) => {
      if (nodePositions[e.id]) {
        pos[e.id] = nodePositions[e.id];
      } else {
        const x = e.x || 300 + (idx % 4) * 160;
        const y = e.y || 200 + Math.floor(idx / 4) * 140;
        pos[e.id] = { x, y };
      }
    });
    setNodePositions(pos);
  }, [entities]);

  // Set default path finder endpoints and reset if case changes
  useEffect(() => {
    if (entities.length >= 2) {
      const currentIds = new Set(entities.map(e => e.id));
      if (!pathSourceId || !currentIds.has(pathSourceId)) {
        setPathSourceId(entities[0].id);
      }
      if (!pathTargetId || !currentIds.has(pathTargetId) || pathTargetId === (pathSourceId || entities[0].id)) {
        setPathTargetId(entities[1].id);
      }
    } else if (entities.length === 1) {
      setPathSourceId(entities[0].id);
      setPathTargetId(entities[0].id);
    }
  }, [entities]);

  const selectedEntity = entities.find(e => e.id === selectedEntityId) || entities[0] || null;

  const filteredEntities = entities.filter(e => {
    if (activeFilterType !== 'ALL' && e.type !== activeFilterType) return false;
    if (e.riskScore < minRisk) return false;
    if (graphSearch.trim() !== '' && !e.name.toLowerCase().includes(graphSearch.toLowerCase())) return false;
    return true;
  });

  const selectedEntityRelationships = selectedEntity
    ? relationships.filter(r => r.sourceId === selectedEntity.id || r.targetId === selectedEntity.id)
    : [];

  // Handle resizing dossier
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingDossier) return;
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= 280 && newWidth <= 560) {
        setDossierWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsDraggingDossier(false);
    };

    if (isDraggingDossier) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingDossier]);

  // Canvas mouse movement for node dragging
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!draggedNodeId || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) / zoomLevel);
    const y = Math.round((e.clientY - rect.top) / zoomLevel);

    setNodePositions(prev => ({
      ...prev,
      [draggedNodeId]: { x: Math.max(50, Math.min(1100, x)), y: Math.max(50, Math.min(700, y)) },
    }));
  };

  const handleCanvasMouseUp = () => {
    setDraggedNodeId(null);
  };

  const handleCalculatePath = () => {
    if (!pathSourceId || !pathTargetId) return;
    findPathBetween(pathSourceId, pathTargetId);
  };

  const getEntityIcon = (type: EntityType) => {
    switch (type) {
      case 'PERSON': return User;
      case 'PHONE': return Phone;
      case 'VEHICLE': return Car;
      case 'LOCATION': return MapPin;
      case 'ORGANIZATION': return Building2;
      default: return Layers;
    }
  };

  const getEntityColorClass = (type: EntityType, risk: number, isBridge?: boolean) => {
    if (risk >= 85) return 'border-red-500/80 bg-red-950/90 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.25)]';
    if (isBridge) return 'border-amber-500/80 bg-amber-950/90 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.25)]';
    switch (type) {
      case 'PERSON': return 'border-purple-500/80 bg-purple-950/90 text-purple-300 shadow-purple-500/20';
      case 'PHONE': return 'border-blue-500/80 bg-blue-950/90 text-blue-300 shadow-blue-500/20';
      case 'VEHICLE': return 'border-amber-500/80 bg-amber-950/90 text-amber-300 shadow-amber-500/20';
      case 'ORGANIZATION': return 'border-emerald-500/80 bg-emerald-950/90 text-emerald-300 shadow-emerald-500/20';
      case 'LOCATION': return 'border-cyan-500/80 bg-cyan-950/90 text-cyan-300 shadow-cyan-500/20';
      default: return 'border-zinc-500 bg-zinc-800 text-zinc-300';
    }
  };

  return (
    <div className={`flex-1 flex bg-[#0A0A0B] text-slate-300 overflow-hidden relative ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Left Column: Investigation Filters & Shortest Path Finder */}
      {!isFullscreen && (
        <aside className="w-80 bg-[#0F0F12] border-r border-white/5 p-4 flex flex-col shrink-0 select-none overflow-y-auto font-sans">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono font-bold tracking-wider text-slate-200">NETWORK CONTROLS</span>
            </div>
            <button 
              onClick={() => { setActiveFilterType('ALL'); setMinRisk(0); setGraphSearch(''); setHighlightedPath(null); }}
              className="text-[10px] text-cyan-400 hover:underline font-mono cursor-pointer"
            >
              Reset All
            </button>
          </div>

          {/* Find Connection / Shortest Path Finder Accordion */}
          <div className="mb-5 bg-[#141418] border border-cyan-500/30 rounded-xl p-3.5 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Route className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-mono font-bold text-white uppercase">FIND CONNECTION</span>
              </div>
              <span className="text-[10px] font-mono bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/20 font-bold">
                BFS HOP TRACE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mb-3">
              Trace direct & multi-hop links between any two criminal entities.
            </p>

            <div className="space-y-2 mb-3">
              <div>
                <label className="text-[10px] font-mono text-slate-500 block mb-1">ORIGIN ENTITY</label>
                <select
                  value={pathSourceId}
                  onChange={(e) => setPathSourceId(e.target.value)}
                  className="w-full bg-[#0A0A0B] border border-white/10 rounded-md px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                >
                  {entities.map(e => (
                    <option key={e.id} value={e.id}>{e.name} ({e.type})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-500 block mb-1">TARGET ENTITY</label>
                <select
                  value={pathTargetId}
                  onChange={(e) => setPathTargetId(e.target.value)}
                  className="w-full bg-[#0A0A0B] border border-white/10 rounded-md px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                >
                  {entities.map(e => (
                    <option key={e.id} value={e.id}>{e.name} ({e.type})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={handleCalculatePath}
                className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-2 rounded-lg text-xs font-mono transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.3)]"
              >
                <Route className="w-3.5 h-3.5" />
                <span>TRACE PATH</span>
              </button>
              {highlightedPath && (
                <button
                  type="button"
                  onClick={() => setHighlightedPath(null)}
                  className="px-2.5 py-2 bg-[#1A1A1F] hover:bg-white/10 text-slate-400 rounded-lg text-xs font-mono"
                  title="Clear Highlight"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Path Result Breakdown */}
            {highlightedPath && (
              <div className="mt-3 pt-3 border-t border-white/10">
                <div className="flex items-center justify-between text-xs font-mono font-bold mb-1.5">
                  <span className={highlightedPath.found ? 'text-emerald-400' : 'text-red-400'}>
                    {highlightedPath.found ? `✓ Path Found (${highlightedPath.hops} ${highlightedPath.hops === 1 ? 'Hop' : 'Hops'})` : '✗ No Path Found'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 font-mono leading-relaxed mb-2">
                  {highlightedPath.explanation}
                </p>

                {highlightedPath.found && highlightedPath.path.length > 0 && (
                  <div className="space-y-1.5 bg-[#0A0A0B] p-2 rounded-lg border border-white/5">
                    {highlightedPath.path.map((step, idx) => (
                      <div key={step.entity.id} className="text-[11px] font-mono">
                        <div className="flex items-center space-x-1 text-slate-200">
                          <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] flex items-center justify-center font-bold">
                            {idx + 1}
                          </span>
                          <span className="font-semibold text-white truncate">{step.entity.name}</span>
                        </div>
                        {step.relationshipToNext && (
                          <div className="pl-5 py-0.5 text-[10px] text-cyan-400 flex items-center space-x-1">
                            <span>↓ [{step.relationshipToNext.type}]</span>
                            <span className="text-slate-500 truncate max-w-[120px]">({step.relationshipToNext.evidence})</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* AI Network Assistant Button */}
          <div className="mb-5">
            <button
              type="button"
              onClick={() => {
                setIsAnalysisModalOpen(true);
                if (!networkReport) {
                  runAiNetworkAnalysis();
                }
              }}
              className="w-full bg-gradient-to-r from-purple-500/20 via-cyan-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-cyan-500/30 border border-purple-500/30 text-white p-3 rounded-xl flex items-center justify-between text-xs font-mono font-bold transition-all shadow-lg cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                <span>RUN AI NETWORK ANALYSIS</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {/* Graph Search */}
          <div className="mb-4">
            <label className="text-[11px] font-mono text-slate-500 mb-1 block">SEARCH GRAPH NODES</label>
            <div className="relative flex items-center">
              <Search className="absolute left-2.5 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                value={graphSearch}
                onChange={(e) => setGraphSearch(e.target.value)}
                placeholder="Search entities, vehicles, phones..."
                className="w-full bg-[#1A1A1F] border border-white/5 rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 font-mono"
              />
            </div>
          </div>

          {/* Entity Type Filter */}
          <div className="mb-5">
            <label className="text-[11px] font-mono text-slate-500 mb-2 block">FILTER BY ENTITY TYPE</label>
            <div className="space-y-1.5">
              {['ALL', 'PERSON', 'PHONE', 'VEHICLE', 'LOCATION', 'ORGANIZATION'].map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveFilterType(type as any)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded text-xs font-mono transition-all cursor-pointer ${
                    activeFilterType === type
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold'
                      : 'bg-[#1A1A1F] text-slate-400 hover:bg-white/5 border border-white/5'
                  }`}
                >
                  <span>{type}</span>
                  <span className="text-[10px] text-slate-500">
                    {type === 'ALL' ? entities.length : entities.filter(e => e.type === type).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Risk Threshold Slider */}
          <div className="mb-5">
            <div className="flex justify-between text-[11px] font-mono text-slate-500 mb-1.5">
              <span>MIN PRIORITY / RISK SCORE</span>
              <span className="text-cyan-400 font-bold">{minRisk} / 100</span>
            </div>
            <input
              type="range"
              min="0"
              max="90"
              step="10"
              value={minRisk}
              onChange={(e) => setMinRisk(Number(e.target.value))}
              className="w-full accent-cyan-400 bg-[#1A1A1F] h-1.5 rounded-lg cursor-pointer"
            />
          </div>

          <div className="mt-auto pt-4 border-t border-white/5 text-[11px] font-mono text-slate-500 space-y-1">
            <div className="flex justify-between">
              <span>Visible Entities:</span>
              <span className="text-slate-300 font-bold">{filteredEntities.length} / {entities.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Active Relationship Links:</span>
              <span className="text-slate-300 font-bold">{relationships.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Bridge Nodes Identified:</span>
              <span className="text-amber-400 font-bold">{entities.filter(e => e.isBridge).length}</span>
            </div>
          </div>
        </aside>
      )}

      {/* Center Canvas: Interactive Network Graph */}
      <main 
        ref={canvasRef}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        className="flex-1 flex flex-col relative overflow-hidden bg-[#0A0A0B]"
      >
        {/* Graph Toolbar */}
        <div className="absolute top-4 left-4 z-20 flex items-center space-x-2 bg-[#0F0F12]/90 backdrop-blur border border-white/10 rounded-lg p-1.5 shadow-xl font-mono text-xs">
          <button
            onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 2))}
            className="p-2 hover:bg-white/5 rounded text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 0.6))}
            className="p-2 hover:bg-white/5 rounded text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <div className="h-4 w-px bg-white/10" />
          <button
            onClick={() => setZoomLevel(1)}
            className="px-2.5 py-1 hover:bg-white/5 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            {Math.round(zoomLevel * 100)}%
          </button>
          <div className="h-4 w-px bg-white/10" />
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 hover:bg-white/5 rounded text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen (ESC)' : 'Fullscreen Network'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Legend Overlay */}
        <div className="absolute bottom-4 left-4 z-20 bg-[#0F0F12]/90 backdrop-blur border border-white/10 rounded-lg px-3 py-2 text-[10px] font-mono text-slate-400 flex items-center space-x-4 shadow-xl pointer-events-none">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span>Person</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span>Phone</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Vehicle</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Organization</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            <span>High Priority (≥75)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Bridge Node</span>
          </div>
        </div>

        {/* Graph Canvas Area */}
        <div className="flex-1 relative overflow-hidden flex items-center justify-center p-8 select-none">
          {/* Background Grid Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

          {/* SVG Connection Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            {relationships.map(rel => {
              const srcPos = nodePositions[rel.sourceId];
              const tgtPos = nodePositions[rel.targetId];
              if (!srcPos || !tgtPos) return null;

              const isSelectedConnection = selectedEntity && (rel.sourceId === selectedEntity.id || rel.targetId === selectedEntity.id);
              const isPathHighlighted = highlightedPath?.edgeIds.includes(rel.id);

              return (
                <g key={rel.id}>
                  <line
                    x1={srcPos.x}
                    y1={srcPos.y}
                    x2={tgtPos.x}
                    y2={tgtPos.y}
                    stroke={
                      isPathHighlighted
                        ? '#22d3ee'
                        : isSelectedConnection
                        ? '#06b6d4'
                        : '#334155'
                    }
                    strokeWidth={isPathHighlighted ? 4 : isSelectedConnection ? 2.5 : 1.2}
                    strokeOpacity={isPathHighlighted ? 1 : isSelectedConnection ? 0.9 : 0.4}
                    strokeDasharray={isPathHighlighted ? undefined : rel.confidence < 80 ? '4 4' : undefined}
                  />
                  {/* Label on link if highlighted or selected */}
                  {(isPathHighlighted || isSelectedConnection) && (
                    <text
                      x={(srcPos.x + tgtPos.x) / 2}
                      y={(srcPos.y + tgtPos.y) / 2 - 6}
                      fill={isPathHighlighted ? '#22d3ee' : '#94a3b8'}
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="middle"
                      className="select-none font-bold"
                    >
                      {rel.type}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Nodes Render */}
          <div 
            className="absolute inset-0 transition-transform duration-150"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {filteredEntities.map(entity => {
              const IconComp = getEntityIcon(entity.type);
              const isSelected = selectedEntity && entity.id === selectedEntity.id;
              const isPathNode = highlightedPath?.nodeIds.includes(entity.id);
              const pos = nodePositions[entity.id] || { x: 300, y: 200 };

              return (
                <div
                  key={entity.id}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setDraggedNodeId(entity.id);
                  }}
                  onClick={() => onSelectEntity(entity.id)}
                  style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing group transition-all z-10"
                >
                  <div className={`relative flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl border backdrop-blur-md shadow-lg transition-all ${
                    getEntityColorClass(entity.type, entity.riskScore, entity.isBridge)
                  } ${
                    isPathNode
                      ? 'ring-4 ring-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.8)] scale-110'
                      : isSelected
                      ? 'ring-2 ring-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.5)] scale-105'
                      : 'hover:scale-105'
                  }`}>
                    {entity.isBridge && (
                      <span className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-amber-500 text-black text-[8px] font-mono font-bold rounded-full uppercase tracking-wider shadow-md">
                        BRIDGE
                      </span>
                    )}
                    <div className="w-7 h-7 rounded-lg bg-black/40 flex items-center justify-center shrink-0">
                      <IconComp className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-left font-mono">
                      <div className="text-xs font-bold text-white tracking-tight">{entity.name}</div>
                      <div className="text-[10px] text-slate-400 flex items-center space-x-1.5 mt-0.5">
                        <span className="uppercase">{entity.type}</span>
                        <span>·</span>
                        <span className="text-red-400 font-bold">RISK: {entity.riskScore}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Right Column: Resizable & Collapsible Entity Dossier */}
      {!isDossierCollapsed && (
        <div 
          onMouseDown={() => setIsDraggingDossier(true)}
          className="w-1.5 bg-white/5 hover:bg-cyan-500/50 cursor-ew-resize transition-colors shrink-0 z-30"
          title="Drag to resize dossier"
        />
      )}

      <aside 
        style={{ width: isDossierCollapsed ? '0px' : `${dossierWidth}px` }}
        className="bg-[#0F0F12] border-l border-white/5 flex flex-col shrink-0 transition-all duration-150 relative overflow-hidden z-20 font-sans"
      >
        {/* Toggle Collapse Button */}
        <button
          onClick={() => setIsDossierCollapsed(!isDossierCollapsed)}
          className="absolute top-4 left-3 z-30 bg-[#1A1A1F] border border-white/10 hover:border-cyan-500 text-slate-400 hover:text-white p-1.5 rounded-md shadow transition-colors cursor-pointer"
          title={isDossierCollapsed ? 'Show Dossier' : 'Hide Dossier'}
        >
          {isDossierCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        {!isDossierCollapsed && selectedEntity && (
          <div className="p-5 overflow-y-auto flex-1 space-y-5 font-mono text-slate-300">
            {/* Dossier Header */}
            <div className="pt-2 pb-3 border-b border-white/10 flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded uppercase font-bold">
                    {selectedEntity.type} DOSSIER
                  </span>
                  {selectedEntity.isBridge && (
                    <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded uppercase font-bold">
                      BRIDGE NODE
                    </span>
                  )}
                </div>
                <h2 className="text-base font-bold text-white mt-1.5">{selectedEntity.name}</h2>
                {selectedEntity.aliases && selectedEntity.aliases.length > 0 && (
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    Aliases: <span className="text-slate-200">{selectedEntity.aliases.join(', ')}</span>
                  </div>
                )}
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded ${
                selectedEntity.riskScore >= 80 ? 'text-red-400 bg-red-500/10 border border-red-500/20' : 'text-amber-400 bg-amber-500/10'
              }`}>
                {selectedEntity.riskLevel}
              </span>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="bg-[#1A1A1F] border border-white/5 rounded-lg p-3 text-center">
                <div className="text-[10px] text-slate-500 uppercase">Priority Score</div>
                <div className="text-lg font-bold text-red-400 font-mono mt-1">{selectedEntity.riskScore}</div>
              </div>
              <div className="bg-[#1A1A1F] border border-white/5 rounded-lg p-3 text-center">
                <div className="text-[10px] text-slate-500 uppercase">Confidence</div>
                <div className="text-lg font-bold text-emerald-400 font-mono mt-1">{selectedEntity.confidence}%</div>
              </div>
              <div className="bg-[#1A1A1F] border border-white/5 rounded-lg p-3 text-center">
                <div className="text-[10px] text-slate-500 uppercase">Links</div>
                <div className="text-lg font-bold text-purple-400 font-mono mt-1">{selectedEntityRelationships.length}</div>
              </div>
            </div>

            {/* Priority / Risk Factors Breakdown */}
            {selectedEntity.priorityReasons && selectedEntity.priorityReasons.length > 0 && (
              <div className="bg-[#141418] border border-red-500/20 rounded-lg p-3 space-y-2">
                <div className="text-[10px] uppercase tracking-wider text-red-400 font-bold flex items-center justify-between">
                  <span>Priority Scoring Factors</span>
                  <span>+{selectedEntity.riskScore} pts</span>
                </div>
                <div className="space-y-1.5">
                  {selectedEntity.priorityReasons.map((factor, idx) => (
                    <div key={idx} className="text-[11px] font-mono flex items-start justify-between text-slate-300">
                      <span className="text-slate-400">{factor.factor}:</span>
                      <span className="text-red-400 font-bold ml-2">+{factor.points}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Details Metadata */}
            <div className="bg-[#1A1A1F] border border-white/5 rounded-lg p-4 space-y-2.5 text-xs">
              <div className="text-[10px] uppercase text-slate-500 mb-1">Entity Attributes</div>
              {selectedEntity.details.age && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Age / Gender:</span>
                  <span className="text-slate-300">{selectedEntity.details.age} yrs, {selectedEntity.details.gender || 'N/A'}</span>
                </div>
              )}
              {selectedEntity.details.phone && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Primary Phone:</span>
                  <span className="text-cyan-400">{selectedEntity.details.phone}</span>
                </div>
              )}
              {selectedEntity.details.vehicleNumber && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Vehicle ID:</span>
                  <span className="text-amber-400">{selectedEntity.details.vehicleNumber}</span>
                </div>
              )}
              {selectedEntity.details.address && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Address:</span>
                  <span className="text-slate-300 text-right max-w-[170px] truncate">{selectedEntity.details.address}</span>
                </div>
              )}
              {selectedEntity.details.notes && (
                <div className="pt-1 border-t border-white/5">
                  <span className="text-slate-500 block mb-0.5">Investigator Notes:</span>
                  <span className="text-slate-300 text-[11px] leading-relaxed">{selectedEntity.details.notes}</span>
                </div>
              )}
              {selectedEntity.priorCases && selectedEntity.priorCases.length > 0 && (
                <div className="flex justify-between pt-1 border-t border-white/5">
                  <span className="text-slate-500">Prior Cases:</span>
                  <span className="text-red-400 font-bold">{selectedEntity.priorCases.join(', ')}</span>
                </div>
              )}
            </div>

            {/* Data Provenance & Traceability */}
            {selectedEntity.provenance && selectedEntity.provenance.length > 0 && (
              <div className="bg-[#141418] border border-white/5 rounded-lg p-3 space-y-2">
                <div className="text-[10px] uppercase text-cyan-400 font-bold flex items-center space-x-1.5">
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Data Provenance & Source Files</span>
                </div>
                <div className="space-y-1.5">
                  {selectedEntity.provenance.map((prov, i) => (
                    <div key={i} className="text-[11px] bg-[#0A0A0B] p-2 rounded border border-white/5">
                      <div className="text-white font-semibold flex items-center justify-between">
                        <span>{prov.sourceFile}</span>
                        <span className="text-[9px] text-emerald-400">VERIFIED</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{prov.sourceRecord || 'Imported Record'}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Connections Card List */}
            <div>
              <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-3 flex items-center justify-between">
                <span>Direct Connections ({selectedEntityRelationships.length})</span>
                <span className="text-cyan-400">Traceable</span>
              </div>
              <div className="space-y-2.5">
                {selectedEntityRelationships.map(rel => {
                  const targetId = rel.sourceId === selectedEntity.id ? rel.targetId : rel.sourceId;
                  const targetEntity = entities.find(e => e.id === targetId);
                  if (!targetEntity) return null;

                  return (
                    <div
                      key={rel.id}
                      onClick={() => onSelectEntity(targetEntity.id)}
                      className="bg-[#1A1A1F] hover:bg-white/5 border border-white/5 rounded-lg p-3 cursor-pointer transition-all group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-white group-hover:text-cyan-400 transition-colors">
                          {targetEntity.name}
                        </span>
                        <span className="text-[10px] bg-cyan-500/10 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-500/20 font-bold">
                          {rel.type}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                        <span className="text-slate-500 truncate max-w-[180px]">{rel.sourceEvidence}</span>
                        <span className="text-emerald-400 font-semibold">{rel.confidence}% conf</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* AI Network Analysis Modal */}
      {isAnalysisModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4 font-sans">
          <div className="bg-[#0F0F12] border border-white/10 rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-sm font-mono font-bold text-white tracking-wide">
                    AI NETWORK ANALYSIS & INVESTIGATIVE SYNTHESIS
                  </h2>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Law Enforcement Link Intelligence · Case {activeCase.caseNumber}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsAnalysisModalOpen(false)} 
                className="text-slate-500 hover:text-white p-1 rounded transition-colors text-xs font-mono"
              >
                ✕ CLOSE
              </button>
            </div>

            <div className="overflow-y-auto flex-1 pr-1 space-y-4 font-mono">
              {isAnalyzingNetwork ? (
                <div className="py-16 text-center space-y-4">
                  <Cpu className="w-10 h-10 text-cyan-400 animate-spin mx-auto" />
                  <div className="text-sm font-bold text-white">Synthesizing Network Link Graph via Gemini...</div>
                  <p className="text-xs text-slate-400">Evaluating bridge nodes, financial layering flows, and cluster boundaries.</p>
                </div>
              ) : networkReport ? (
                <div className="space-y-4">
                  {/* Executive Summary */}
                  <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-xl p-4">
                    <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">
                      EXECUTIVE LINK ANALYSIS SUMMARY
                    </h3>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {networkReport.executiveSummary}
                    </p>
                  </div>

                  {/* Network Topology & Bridges */}
                  <div className="bg-[#141418] border border-white/10 rounded-xl p-4">
                    <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                      <Split className="w-3.5 h-3.5" />
                      <span>Topology & Key Bridge Entities</span>
                    </h3>
                    <div className="text-xs text-slate-300 space-y-1.5">
                      <div><span className="text-slate-500">Topology:</span> {networkReport.networkStructure.topologyType}</div>
                      <div><span className="text-slate-500">Identified Bridges:</span> {networkReport.networkStructure.bridgeEntities.join(', ') || 'No critical articulation points'}</div>
                      <div><span className="text-slate-500">Clusters:</span> {networkReport.networkStructure.clusterBreakdown}</div>
                    </div>
                  </div>

                  {/* Key Entities */}
                  <div className="bg-[#141418] border border-white/10 rounded-xl p-4">
                    <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-3">
                      CRITICAL ACTORS / NODES OF INTEREST
                    </h3>
                    <div className="space-y-2.5">
                      {networkReport.keyEntities.map((ent, i) => (
                        <div key={i} className="bg-[#0A0A0B] p-3 rounded-lg border border-white/5">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-white">{ent.name}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                              ent.priorityLevel === 'HIGH' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-amber-500/10 text-amber-400'
                            }`}>
                              {ent.priorityLevel} PRIORITY
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 mb-1">{ent.roleDescription}</div>
                          <div className="text-[11px] text-cyan-400">{ent.analyticalSignificance}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommended Investigative Questions */}
                  <div className="bg-[#141418] border border-white/10 rounded-xl p-4">
                    <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
                      RECOMMENDED INVESTIGATIVE QUESTIONS
                    </h3>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {networkReport.recommendedInvestigativeQuestions.map((q, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <span className="text-cyan-400 font-bold">Q{idx + 1}:</span>
                          <span>{q}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="pt-4 border-t border-white/10 mt-4 flex justify-between items-center text-xs font-mono">
              <button
                type="button"
                disabled={isAnalyzingNetwork || !canRunAiAnalysis}
                onClick={() => runAiNetworkAnalysis()}
                className="px-4 py-2 bg-[#1A1A1F] hover:bg-white/10 text-cyan-400 rounded-lg transition-colors flex items-center space-x-2 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzingNetwork ? 'animate-spin' : ''}`} />
                <span>Re-Analyze Link Graph</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAnalysisModalOpen(false)}
                className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg transition-all cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              >
                DONE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

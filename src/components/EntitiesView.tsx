import React, { useState } from 'react';
import { Search, Filter, ShieldAlert, User, Phone, Car, MapPin, Building2, ChevronRight } from 'lucide-react';
import { Entity, EntityType } from '../types';

interface EntitiesViewProps {
  entities: Entity[];
  onSelectEntity: (id: string) => void;
  onNavigateToNetwork?: () => void;
}

export const EntitiesView: React.FC<EntitiesViewProps> = ({ entities = [], onSelectEntity, onNavigateToNetwork }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<EntityType | 'ALL'>('ALL');

  const safeEntities = entities || [];

  const filtered = safeEntities.filter(e => {
    if (typeFilter !== 'ALL' && e.type !== typeFilter) return false;
    if (searchTerm.trim() !== '' && !e.name.toLowerCase().includes(searchTerm.toLowerCase()) && !(e.details?.phone && e.details.phone.includes(searchTerm))) return false;
    return true;
  });

  return (
    <div className="flex-1 bg-[#0A0A0B] p-8 text-slate-300 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Intelligence Entities Database</h1>
            <p className="text-xs text-slate-400 mt-1 font-mono">Comprehensive index of all resolved people, phones, vehicles, and organizations.</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative flex items-center">
              <Search className="absolute left-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search database..."
                className="bg-[#1A1A1F] border border-white/5 rounded-md pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 font-mono w-64"
              />
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-2 mb-6 overflow-x-auto pb-2">
          {['ALL', 'PERSON', 'PHONE', 'VEHICLE', 'LOCATION', 'ORGANIZATION'].map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t as any)}
              className={`px-3 py-1.5 rounded text-xs font-mono transition-all whitespace-nowrap ${
                typeFilter === t
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold'
                  : 'bg-[#1A1A1F] text-slate-400 hover:bg-white/5 border border-white/5'
              }`}
            >
              {t} ({t === 'ALL' ? entities.length : entities.filter(e => e.type === t).length})
            </button>
          ))}
        </div>

        {/* Entities Table / Cards */}
        <div className="bg-[#0F0F12] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-[#0A0A0B] text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                  <th className="p-4">Entity Name</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Risk Score</th>
                  <th className="p-4">Confidence</th>
                  <th className="p-4">Primary Identifier</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs font-mono">
                {filtered.map(entity => (
                  <tr 
                    key={entity.id}
                    className="hover:bg-white/5 transition-colors group cursor-pointer"
                    onClick={() => {
                      onSelectEntity(entity.id);
                      if (onNavigateToNetwork) onNavigateToNetwork();
                    }}
                  >
                    <td className="p-4 font-semibold text-white group-hover:text-cyan-400 transition-colors">
                      {entity.name}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        entity.type === 'PERSON' ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20' :
                        entity.type === 'PHONE' ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20' :
                        entity.type === 'VEHICLE' ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' :
                        'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                      }`}>
                        {entity.type}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`font-bold px-2 py-0.5 rounded ${
                        entity.riskScore >= 80 ? 'text-red-400 bg-red-500/10 border border-red-500/20' :
                        entity.riskScore >= 60 ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20' :
                        'text-cyan-400 bg-cyan-500/10'
                      }`}>
                        {entity.riskScore} / 100
                      </span>
                    </td>
                    <td className="p-4 text-emerald-400">{entity.confidence}%</td>
                    <td className="p-4 text-slate-400">
                      {entity.details.phone || entity.details.vehicleNumber || entity.details.address || 'N/A'}
                    </td>
                    <td className="p-4 text-right">
                      <button className="text-cyan-400 hover:underline flex items-center space-x-1 ml-auto">
                        <span>Inspect</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

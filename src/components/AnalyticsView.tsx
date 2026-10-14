import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid 
} from 'recharts';
import { BarChart3, TrendingUp, ShieldAlert, Users } from 'lucide-react';
import { Entity } from '../types';

interface AnalyticsViewProps {
  entities: Entity[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ entities }) => {
  const typeData = [
    { name: 'Person', count: entities.filter(e => e.type === 'PERSON').length, color: '#c084fc' },
    { name: 'Phone', count: entities.filter(e => e.type === 'PHONE').length, color: '#60a5fa' },
    { name: 'Vehicle', count: entities.filter(e => e.type === 'VEHICLE').length, color: '#fbbf24' },
    { name: 'Location', count: entities.filter(e => e.type === 'LOCATION').length, color: '#22d3ee' },
    { name: 'Organization', count: entities.filter(e => e.type === 'ORGANIZATION').length, color: '#34d399' },
  ];

  const riskDistribution = [
    { range: '0-30 Low', count: entities.filter(e => e.riskScore < 40).length },
    { range: '40-69 Medium', count: entities.filter(e => e.riskScore >= 40 && e.riskScore < 75).length },
    { range: '75-100 High/Critical', count: entities.filter(e => e.riskScore >= 75).length },
  ];

  const activityTimelineData = [
    { month: 'Apr', communications: 120, transactions: 4 },
    { month: 'May', communications: 180, transactions: 7 },
    { month: 'Jun', communications: 290, transactions: 12 },
    { month: 'Jul', communications: 410, transactions: 19 },
    { month: 'Aug', communications: 650, transactions: 28 },
  ];

  return (
    <div className="flex-1 bg-[#0A0A0B] p-8 text-slate-300 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-white">Network Analytics & Metrics</h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">Analytical insights, centrality distribution, and activity volume trends.</p>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Entity Breakdown Chart */}
          <div className="bg-[#0F0F12] border border-white/10 rounded-xl p-6 shadow-xl">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 mb-4">Entity Type Distribution</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={typeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} fontFamily="monospace" />
                  <YAxis stroke="#64748b" fontSize={11} fontFamily="monospace" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0F0F12', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '6px', fontSize: '11px', fontFamily: 'monospace' }}
                  />
                  <Bar dataKey="count" fill="#22d3ee" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Risk Level Distribution */}
          <div className="bg-[#0F0F12] border border-white/10 rounded-xl p-6 shadow-xl">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 mb-4">Risk Score Breakdown</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riskDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="range" stroke="#64748b" fontSize={11} fontFamily="monospace" />
                  <YAxis stroke="#64748b" fontSize={11} fontFamily="monospace" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0F0F12', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '6px', fontSize: '11px', fontFamily: 'monospace' }}
                  />
                  <Bar dataKey="count" fill="#f87171" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Activity Trend Line Chart */}
        <div className="bg-[#0F0F12] border border-white/10 rounded-xl p-6 shadow-xl">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 mb-4">Communication & Financial Transaction Trend</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityTimelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} fontFamily="monospace" />
                <YAxis stroke="#64748b" fontSize={11} fontFamily="monospace" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F0F12', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '6px', fontSize: '11px', fontFamily: 'monospace' }}
                />
                <Line type="monotone" dataKey="communications" stroke="#22d3ee" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="transactions" stroke="#fbbf24" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

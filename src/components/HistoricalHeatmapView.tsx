import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Globe, Filter, Calendar, Layers, Shield, Compass, Sliders, ExternalLink } from 'lucide-react';
import { Entity } from '../types';
import L from 'leaflet';

interface HistoricalHeatmapViewProps {
  entities: Entity[];
}

export const HistoricalHeatmapView: React.FC<HistoricalHeatmapViewProps> = ({ entities }) => {
  const [viewMode, setViewMode] = useState<'heatmap' | 'map'>('map');
  const [timeRange, setTimeRange] = useState<'1yr' | '3yr' | '5yr' | 'all'>('3yr');
  const [radiusKm, setRadiusKm] = useState<number>(10);
  const [caseTypeFilter, setCaseTypeFilter] = useState<string>('ALL');

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Simulated historical GIS points
  const historicalLocations = [
    { id: 'loc-1', name: 'Andheri East Warehouse (Plot 18)', type: 'NARCOTICS', incidents: 14, lat: 19.1136, lng: 72.8697, risk: 'HIGH', year: '2024' },
    { id: 'loc-2', name: 'Bandra West Financial Conduit', type: 'FRAUD', incidents: 8, lat: 19.0596, lng: 72.8295, risk: 'HIGH', year: '2023' },
    { id: 'loc-3', name: 'Kurla West Transit Hub', type: 'ORGANIZED_CRIME', incidents: 19, lat: 19.0657, lng: 72.8887, risk: 'CRITICAL', year: '2022' },
    { id: 'loc-4', name: 'Thane MIDC Industrial Park', type: 'PROPERTY_CRIME', incidents: 11, lat: 19.2183, lng: 72.9781, risk: 'MEDIUM', year: '2023' },
    { id: 'loc-5', name: 'Pune Expressway Toll Plaza', type: 'VEHICLE_CRIME', incidents: 24, lat: 18.5204, lng: 73.8567, risk: 'HIGH', year: '2024' },
    { id: 'loc-6', name: 'Colaba Maritime Wharf', type: 'NARCOTICS', incidents: 16, lat: 18.9067, lng: 72.8147, risk: 'CRITICAL', year: '2024' }
  ];

  const filteredLocations = historicalLocations.filter(loc => {
    if (caseTypeFilter !== 'ALL' && loc.type !== caseTypeFilter) return false;
    return true;
  });

  useEffect(() => {
    if (viewMode === 'map' && mapContainerRef.current) {
      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [19.0760, 72.8777],
          zoom: 11,
          zoomControl: false
        });

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        // CartoDB Dark Matter Tactical Tile Layer
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors & CARTO'
        }).addTo(map);

        mapInstanceRef.current = map;
      }

      const map = mapInstanceRef.current;

      // Clear existing markers/circles if any
      map.eachLayer((layer) => {
        if (layer instanceof L.Circle || layer instanceof L.Marker) {
          map.removeLayer(layer);
        }
      });

      // Add markers and heat circles for filtered locations
      filteredLocations.forEach(loc => {
        const color = loc.risk === 'CRITICAL' ? '#ef4444' : loc.risk === 'HIGH' ? '#f59e0b' : '#06b6d4';

        // Outer soft heat radius circle
        L.circle([loc.lat, loc.lng], {
          radius: radiusKm * 250,
          color: color,
          fillColor: color,
          fillOpacity: 0.15,
          weight: 1
        }).addTo(map);

        // Marker pin
        const marker = L.circleMarker([loc.lat, loc.lng], {
          radius: 8,
          color: '#ffffff',
          fillColor: color,
          fillOpacity: 0.9,
          weight: 2
        }).addTo(map);

        marker.bindPopup(`
          <div style="font-family: monospace; background: #0F0F12; color: #fff; padding: 8px; border-radius: 6px;">
            <strong style="color: #06b6d4; font-size: 12px;">${loc.name}</strong>
            <div style="font-size: 11px; margin-top: 4px; color: #94a3b8;">Type: ${loc.type}</div>
            <div style="font-size: 11px; color: #94a3b8;">Incidents: ${loc.incidents} (${loc.year})</div>
            <div style="font-size: 10px; margin-top: 6px; padding: 2px 6px; background: rgba(239, 68, 68, 0.2); color: #f87171; display: inline-block; border-radius: 4px;">RISK: ${loc.risk}</div>
          </div>
        `);
      });

      setTimeout(() => {
        map.invalidateSize();
      }, 150);
    }

    return () => {
      if (mapInstanceRef.current && viewMode !== 'map') {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [viewMode, filteredLocations, radiusKm]);

  return (
    <div className="flex-1 bg-[#0A0A0B] p-8 text-slate-300 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2.5">
              <Globe className="w-6 h-6 text-cyan-400" />
              <span>Historical Intelligence & Geographic Heatmap</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Geospatial incident concentrations, past case overlaps, and temporal hotspot analytics.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex bg-[#0F0F12] border border-white/10 rounded p-1 font-mono text-xs">
              <button
                onClick={() => setViewMode('map')}
                className={`px-3 py-1.5 rounded transition-all cursor-pointer ${
                  viewMode === 'map' ? 'bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-500/20' : 'text-slate-400 hover:text-white'
                }`}
              >
                Interactive GIS Map
              </button>
              <button
                onClick={() => setViewMode('heatmap')}
                className={`px-3 py-1.5 rounded transition-all cursor-pointer ${
                  viewMode === 'heatmap' ? 'bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-500/20' : 'text-slate-400 hover:text-white'
                }`}
              >
                Heatmap Grid
              </button>
            </div>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="bg-[#0F0F12] border border-white/10 rounded-xl p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          <div>
            <label className="text-slate-400 block mb-1">Historical Range</label>
            <div className="flex bg-[#1A1A1F] border border-white/5 rounded p-1">
              {(['1yr', '3yr', '5yr', 'all'] as const).map(range => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`flex-1 py-1 rounded text-center transition-all uppercase cursor-pointer ${
                    timeRange === range ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Geographic Radius: <strong className="text-cyan-400">{radiusKm} km</strong></label>
            <input
              type="range"
              min="1"
              max="25"
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="w-full accent-cyan-400 mt-2 bg-[#1A1A1F] cursor-pointer"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Case Type Filter</label>
            <select
              value={caseTypeFilter}
              onChange={(e) => setCaseTypeFilter(e.target.value)}
              className="w-full bg-[#1A1A1F] border border-white/5 rounded px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Case Types</option>
              <option value="NARCOTICS">Narcotics</option>
              <option value="FRAUD">Fraud / Financial</option>
              <option value="ORGANIZED_CRIME">Organized Crime</option>
              <option value="PROPERTY_CRIME">Property Crime</option>
              <option value="VEHICLE_CRIME">Vehicle Crime</option>
            </select>
          </div>
        </div>

        {/* Main Heatmap Visualization Canvas / GIS Map */}
        <div className="bg-[#0F0F12] border border-white/10 rounded-xl p-6 shadow-2xl relative">
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6 font-mono">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">Geospatial Concentration Analysis</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Current Case Radius: <strong>{radiusKm} km</strong> from Andheri East Hub | Overlap Confidence: <strong>HIGH</strong></p>
            </div>
            <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded">
              Historical Overlap Detected
            </span>
          </div>

          {viewMode === 'map' ? (
            <div className="w-full h-[500px] rounded-xl overflow-hidden border border-white/10 relative">
              <div ref={mapContainerRef} className="w-full h-full z-10" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono">
              {filteredLocations.map(loc => (
                <div key={loc.id} className="bg-[#1A1A1F] border border-white/5 rounded-xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] bg-white/5 text-slate-300 px-2 py-0.5 rounded border border-white/5">
                        {loc.type}
                      </span>
                      <span className="text-[10px] text-cyan-400 font-bold">{loc.year} Archive</span>
                    </div>
                    <h3 className="text-sm font-bold text-white mb-2">{loc.name}</h3>
                    <p className="text-xs text-slate-400 font-sans">
                      Historical incident density: <strong className="text-white font-mono">{loc.incidents} recorded cases</strong> within selected {radiusKm}km perimeter.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Risk Level:</span>
                    <span className={`font-bold ${loc.risk === 'CRITICAL' ? 'text-red-400' : 'text-amber-400'}`}>
                      {loc.risk}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

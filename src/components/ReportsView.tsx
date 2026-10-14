import React, { useState } from 'react';
import { FileSpreadsheet, Download, Share2, CheckCircle2, ShieldAlert, History, Trash2, Eye, FileText, Printer, Check, Info } from 'lucide-react';
import { InvestigationCase, Entity, AIAlert, GeneratedReport } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface ReportsViewProps {
  activeCase: InvestigationCase;
  entities: Entity[];
  alerts: AIAlert[];
  reports: GeneratedReport[];
  onAddReport: (report: GeneratedReport) => void;
  onDeleteReport: (reportId: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ 
  activeCase, 
  entities = [], 
  alerts = [], 
  reports = [], 
  onAddReport, 
  onDeleteReport 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedReport, setSelectedReport] = useState<GeneratedReport | null>(null);
  const [activeTab, setActiveTab] = useState<'generator' | 'history'>('generator');
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const { t } = useLanguage();

  const safeEntities = Array.isArray(entities) ? entities : [];
  const safeAlerts = Array.isArray(alerts) ? alerts : [];
  const safeReports = Array.isArray(reports) ? reports : [];

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      const newReport: GeneratedReport = {
        id: `REP-${Math.floor(100000 + Math.random() * 900000)}`,
        caseNumber: activeCase.caseNumber,
        caseTitle: activeCase.title,
        category: activeCase.category,
        generatedBy: activeCase.investigator || 'Cmdr. V. R. Sharma',
        generatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        status: 'GENERATED',
        summary: activeCase.description || 'Comprehensive intelligence report consolidating link graph analysis and verified evidence vectors.',
        entitiesSummary: {
          people: safeEntities.filter(e => e.type === 'PERSON').length,
          organizations: safeEntities.filter(e => e.type === 'ORGANIZATION').length,
          vehicles: safeEntities.filter(e => e.type === 'VEHICLE').length,
          locations: safeEntities.filter(e => e.type === 'LOCATION').length,
          other: safeEntities.filter(e => !['PERSON', 'ORGANIZATION', 'VEHICLE', 'LOCATION'].includes(e.type)).length,
        },
        networkStats: {
          totalEntities: safeEntities.length,
          totalRelationships: activeCase.relationshipsCount ?? 0,
          highRiskCount: safeEntities.filter(e => (e.riskScore ?? 0) >= 75).length,
        },
        tasksSummary: { completed: 4, pending: 2, overdue: 0 },
        roadmapProgress: { completed: 2, total: 3 },
        alertsCount: safeAlerts.length,
        evidenceCount: 3,
      };
      onAddReport(newReport);
      setSelectedReport(newReport);
    }, 900);
  };

  const handleExportPrint = (report?: GeneratedReport) => {
    const targetReport = report || selectedReport || {
      id: `REP-${activeCase.caseNumber}`,
      caseNumber: activeCase.caseNumber,
      caseTitle: activeCase.title,
      category: activeCase.category,
      generatedBy: activeCase.investigator || 'Lead Investigator',
      generatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: 'GENERATED',
      summary: activeCase.description,
      entitiesSummary: {
        people: safeEntities.filter(e => e.type === 'PERSON').length,
        organizations: safeEntities.filter(e => e.type === 'ORGANIZATION').length,
        vehicles: safeEntities.filter(e => e.type === 'VEHICLE').length,
        locations: safeEntities.filter(e => e.type === 'LOCATION').length,
        other: safeEntities.filter(e => !['PERSON', 'ORGANIZATION', 'VEHICLE', 'LOCATION'].includes(e.type)).length,
      },
      networkStats: {
        totalEntities: safeEntities.length,
        totalRelationships: activeCase.relationshipsCount ?? 0,
        highRiskCount: safeEntities.filter(e => (e.riskScore ?? 0) >= 75).length,
      },
      tasksSummary: { completed: 3, pending: 1, overdue: 0 },
      roadmapProgress: { completed: 2, total: 3 },
      alertsCount: safeAlerts.length,
      evidenceCount: 2,
    };

    // Open a formatted print window with official police intelligence dossier styling
    const printWindow = window.open('', '_blank', 'width=900,height=750');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>CHAKRA Intelligence Dossier - ${targetReport.caseNumber}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Inter:wght@400;500;700&display=swap');
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
              color: #111827;
              margin: 0;
              padding: 32px;
              background: #fff;
            }
            .header-banner {
              border-bottom: 2px solid #0f172a;
              padding-bottom: 16px;
              margin-bottom: 24px;
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
            }
            .agency-title {
              font-size: 20px;
              font-weight: 800;
              letter-spacing: -0.5px;
              color: #0f172a;
              text-transform: uppercase;
            }
            .sub-title {
              font-family: 'JetBrains Mono', monospace;
              font-size: 11px;
              color: #475569;
              margin-top: 4px;
            }
            .badge {
              font-family: 'JetBrains Mono', monospace;
              font-size: 10px;
              font-weight: 700;
              border: 1px solid #dc2626;
              color: #dc2626;
              padding: 4px 8px;
              border-radius: 4px;
              text-transform: uppercase;
            }
            .meta-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 12px;
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 6px;
              padding: 12px;
              margin-bottom: 24px;
              font-size: 12px;
            }
            .meta-item strong {
              display: block;
              font-size: 10px;
              color: #64748b;
              text-transform: uppercase;
              font-family: 'JetBrains Mono', monospace;
            }
            .section-title {
              font-family: 'JetBrains Mono', monospace;
              font-size: 12px;
              font-weight: 700;
              text-transform: uppercase;
              color: #0284c7;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 6px;
              margin-top: 20px;
              margin-bottom: 10px;
            }
            p, li {
              font-size: 13px;
              line-height: 1.6;
              color: #334155;
            }
            .stats-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 8px;
              font-size: 12px;
            }
            .stats-table th, .stats-table td {
              border: 1px solid #e2e8f0;
              padding: 8px 12px;
              text-align: left;
            }
            .stats-table th {
              background: #f1f5f9;
              font-family: 'JetBrains Mono', monospace;
              font-size: 11px;
            }
            .signature-block {
              margin-top: 48px;
              display: flex;
              justify-content: space-between;
              font-size: 12px;
              font-family: 'JetBrains Mono', monospace;
            }
            .sign-line {
              width: 200px;
              border-top: 1px solid #0f172a;
              margin-top: 40px;
              text-align: center;
              padding-top: 4px;
              color: #64748b;
            }
            @media print {
              body { padding: 0; }
              @page { margin: 1.5cm; }
            }
          </style>
        </head>
        <body>
          <div class="header-banner">
            <div>
              <div class="agency-title">CHAKRA Intelligence Bureau</div>
              <div class="sub-title">National Criminal Nexus & Network Intelligence Analysis System</div>
            </div>
            <div class="badge">CONFIDENTIAL // LAW ENFORCEMENT ONLY</div>
          </div>

          <div class="meta-grid">
            <div class="meta-item">
              <strong>Case Number</strong>
              <span>${targetReport.caseNumber}</span>
            </div>
            <div class="meta-item">
              <strong>Classification</strong>
              <span>${targetReport.category}</span>
            </div>
            <div class="meta-item">
              <strong>Lead Investigator</strong>
              <span>${targetReport.generatedBy}</span>
            </div>
            <div class="meta-item">
              <strong>Dossier Ref</strong>
              <span>${targetReport.id}</span>
            </div>
          </div>

          <div class="section-title">1. Executive Overview</div>
          <p><strong>${targetReport.caseTitle}:</strong> ${targetReport.summary}</p>
          <p>This automated intelligence dossier synthesizes entity resolution matrices, Call Detail Record (CDR) tower triangulation, and financial ledger forensic links.</p>

          <div class="section-title">2. Network Intelligence Metrics</div>
          <table class="stats-table">
            <thead>
              <tr>
                <th>Total Entities</th>
                <th>High Risk Targets</th>
                <th>Direct Relationships</th>
                <th>Open Alerts</th>
                <th>People / Suspects</th>
                <th>Vehicles / Transport</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>${targetReport.networkStats.totalEntities}</strong></td>
                <td><strong>${targetReport.networkStats.highRiskCount}</strong></td>
                <td><strong>${targetReport.networkStats.totalRelationships}</strong></td>
                <td><strong>${targetReport.alertsCount}</strong></td>
                <td><strong>${targetReport.entitiesSummary.people}</strong></td>
                <td><strong>${targetReport.entitiesSummary.vehicles}</strong></td>
              </tr>
            </tbody>
          </table>

          <div class="section-title">3. Actionable Leads & Investigation Roadmap</div>
          <ul>
            <li>• Execute targeted summons for high-degree network nodes identified via degree centrality scoring.</li>
            <li>• Review flagged cross-border and shell corporation banking records with Financial Intelligence Unit (FIU).</li>
            <li>• Verify cloned vehicle registrations against national ANPR toll camera correlation matrix.</li>
          </ul>

          <div class="signature-block">
            <div>
              <div class="sign-line">Investigating Officer Sign</div>
            </div>
            <div>
              <div class="sign-line">Supervisory Authority Sign</div>
            </div>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 400);

      setExportNotice(`Print and PDF export initiated for dossier ${targetReport.id} (${targetReport.caseNumber})`);
      setTimeout(() => setExportNotice(null), 5000);
    } else {
      // Fallback to window.print if popup blocked
      window.print();
      setExportNotice(`Print dialog triggered for ${targetReport.caseNumber}`);
      setTimeout(() => setExportNotice(null), 5000);
    }
  };

  return (
    <div className="flex-1 bg-[#0A0A0B] p-8 text-slate-300 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-1">
              <span className="bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded font-bold">
                REPORTING CONTEXT: {activeCase.caseNumber}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Investigation Report Generator</h1>
            <p className="text-xs text-slate-400 mt-1 font-mono">Compile executive intelligence reports, network analysis, and AI lead summaries.</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex bg-[#1A1A1F] p-1 rounded-lg border border-white/10 font-mono text-xs">
              <button
                onClick={() => setActiveTab('generator')}
                className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${activeTab === 'generator' ? 'bg-cyan-500 text-black font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                Generator
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-3 py-1.5 rounded-md transition-colors flex items-center space-x-1.5 cursor-pointer ${activeTab === 'history' ? 'bg-cyan-500 text-black font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                <History className="w-3.5 h-3.5" />
                <span>History ({safeReports.length})</span>
              </button>
            </div>

            {activeTab === 'generator' && (
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-5 py-2.5 rounded text-xs flex items-center space-x-2 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 font-mono cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-black" />
                <span>{isGenerating ? 'GENERATING REPORT...' : 'GENERATE DOSSIER'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Export Notification Banner */}
        {exportNotice && (
          <div className="bg-cyan-950/40 border border-cyan-500/30 rounded-lg p-3 mb-6 flex items-center space-x-3 text-cyan-300 text-xs font-mono">
            <Printer className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{exportNotice}</span>
          </div>
        )}

        {activeTab === 'generator' ? (
          <div className="bg-[#0F0F12] border border-white/10 rounded-xl p-8 shadow-2xl relative">
            <div className="absolute top-6 right-6 flex items-center space-x-2">
              <span className="text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-1 rounded font-bold">
                CONFIDENTIAL • {activeCase.caseNumber}
              </span>
            </div>

            <div className="border-b border-white/10 pb-6 mb-6">
              <div className="text-xs font-mono text-cyan-400 mb-1 font-semibold">CHAKRA INTELLIGENCE DOSSIER COMPILER</div>
              <h2 className="text-xl font-bold text-white">{activeCase.title}</h2>
              <p className="text-xs text-slate-400 font-mono mt-2">
                Case Number: <span className="text-cyan-300 font-bold">{activeCase.caseNumber}</span> | Lead Investigator: <span className="text-slate-200">{activeCase.investigator || 'Cmdr. V. R. Sharma'}</span>
              </p>
            </div>

            <div className="space-y-6 text-xs text-slate-300 font-mono">
              <div>
                <h3 className="text-cyan-400 font-bold uppercase tracking-wider mb-2">1. Executive Summary</h3>
                <p className="text-slate-400 leading-relaxed font-sans">
                  {activeCase.description || 'Active criminal investigation.'} Graph centrality analysis has identified {safeEntities.length} interconnected entities with high-risk priority clustering for case <span className="text-white font-mono">{activeCase.caseNumber}</span>.
                </p>
              </div>

              <div>
                <h3 className="text-cyan-400 font-bold uppercase tracking-wider mb-2">2. Network Scale & Metrics</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-[#1A1A1F] border border-white/5 p-3.5 rounded-lg text-center">
                    <div className="text-slate-500 text-[10px] uppercase">Total Entities</div>
                    <div className="text-base font-bold text-white mt-1">{safeEntities.length}</div>
                  </div>
                  <div className="bg-[#1A1A1F] border border-white/5 p-3.5 rounded-lg text-center">
                    <div className="text-slate-500 text-[10px] uppercase">High Risk Entities</div>
                    <div className="text-base font-bold text-red-400 mt-1">{safeEntities.filter(e => (e.riskScore ?? 0) >= 75).length}</div>
                  </div>
                  <div className="bg-[#1A1A1F] border border-white/5 p-3.5 rounded-lg text-center">
                    <div className="text-slate-500 text-[10px] uppercase">Open AI Alerts</div>
                    <div className="text-base font-bold text-amber-400 mt-1">{safeAlerts.length}</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-cyan-400 font-bold uppercase tracking-wider mb-2">3. Primary Investigative Leads</h3>
                <ul className="space-y-2 text-slate-400 font-sans">
                  <li>• High frequency communication bursts between primary targets across active telephone nodes.</li>
                  <li>• Suspicious financial asset transfers mapped across flagged intermediary accounts.</li>
                  <li>• Geographic waypoint convergence verified via physical surveillance and ANPR logs.</li>
                </ul>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-2 text-emerald-400 text-xs font-mono">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>
                  {selectedReport 
                    ? `Dossier compiled & saved as ${selectedReport.id}` 
                    : `Active Case Dossier ready for ${activeCase.caseNumber}`}
                </span>
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={() => handleExportPrint(selectedReport || undefined)}
                  className="bg-[#1A1A1F] hover:bg-cyan-500/10 hover:border-cyan-500/40 border border-white/10 text-slate-200 px-4 py-2.5 rounded text-xs font-mono flex items-center space-x-2 cursor-pointer transition-all"
                >
                  <Printer className="w-3.5 h-3.5 text-cyan-400" />
                  <span>EXPORT PDF / PRINT</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {safeReports.length === 0 ? (
              <div className="bg-[#0F0F12] border border-white/10 rounded-xl p-12 text-center">
                <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-300 font-mono">No Investigation Reports Generated</h3>
                <p className="text-xs text-slate-500 mt-1 font-mono">Switch to the Generator tab and click "GENERATE DOSSIER" to create certified intelligence reports.</p>
              </div>
            ) : (
              safeReports.map(rep => (
                <div key={rep.id} className="bg-[#0F0F12] border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:border-cyan-500/40 transition-all font-mono gap-4">
                  <div>
                    <div className="flex items-center space-x-3">
                      <span className="text-xs font-bold text-cyan-400">{rep.id}</span>
                      <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-slate-300 font-bold">{rep.caseNumber}</span>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">{rep.status}</span>
                    </div>
                    <div className="text-sm font-semibold text-white mt-1 font-sans">{rep.caseTitle}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Generated by {rep.generatedBy} on {rep.generatedAt} · {rep.networkStats?.totalEntities ?? 0} entities · {rep.networkStats?.highRiskCount ?? 0} high-risk
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 self-end sm:self-auto shrink-0">
                    <button
                      onClick={() => handleExportPrint(rep)}
                      className="p-2.5 bg-[#1A1A1F] hover:bg-white/5 border border-white/10 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                      title="Print / Export PDF"
                    >
                      <Printer className="w-4 h-4 text-cyan-400" />
                    </button>
                    <button
                      onClick={() => onDeleteReport(rep.id)}
                      className="p-2.5 bg-[#1A1A1F] hover:bg-red-500/20 border border-white/10 text-red-400 rounded-lg transition-colors cursor-pointer"
                      title="Delete Report"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

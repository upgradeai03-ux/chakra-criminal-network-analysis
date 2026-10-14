import React, { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar, NavTab } from './components/Sidebar';
import { OverviewDashboard } from './components/OverviewDashboard';
import { InvestigationWorkspace } from './components/InvestigationWorkspace';
import { EntitiesView } from './components/EntitiesView';
import { AlertsView } from './components/AlertsView';
import { AnalyticsView } from './components/AnalyticsView';
import { EvidenceView } from './components/EvidenceView';
import { ReportsView } from './components/ReportsView';
import { TaskManagementView } from './components/TaskManagementView';
import { TeamCollaborationView } from './components/TeamCollaborationView';
import { RelatedCasesView } from './components/RelatedCasesView';
import { HistoricalHeatmapView } from './components/HistoricalHeatmapView';
import { AiRoadmapView } from './components/AiRoadmapView';
import { TranslatorView } from './components/TranslatorView';
import { AdminPortalView } from './components/AdminPortalView';
import { ReasoningView } from './components/ReasoningView';
import { DataIngestionModal } from './components/DataIngestionModal';
import { EntityResolutionModal } from './components/EntityResolutionModal';
import { FooterDisclaimer } from './components/FooterDisclaimer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { IntelligenceProvider, useIntelligence } from './context/IntelligenceContext';
import { CaseTask, GeneratedReport, RoadmapStep } from './types';

function MainAppContent() {
  const { t } = useLanguage();
  const { 
    activeCase,
    entities,
    relationships,
    alerts,
    tasks,
    relatedCases,
    roadmapSteps,
    caseOfficers,
    evidenceSources,
    reports,
    auditLogs,
    selectedEntityId,
    setSelectedEntityId,
    setActiveCaseNumber,
    isSwitchingCase,
    switchProgressText,
    addTask,
    updateTaskStatus,
    toggleLinkCase,
    updateRoadmapStepStatus,
    addReport,
    deleteReport,
  } = useIntelligence();

  const { availableOfficersList } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [isIngestionOpen, setIsIngestionOpen] = useState(false);
  const [isResolutionOpen, setIsResolutionOpen] = useState(false);

  const handleSelectCase = (caseNum: string) => {
    setActiveCaseNumber(caseNum);
  };

  const handleSelectEntity = (id: string) => {
    setSelectedEntityId(id);
    setActiveTab('network');
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0A0A0B] text-slate-300 font-sans select-none relative">
      {/* Case Switching Loading Overlay */}
      {isSwitchingCase && (
        <div className="absolute inset-0 bg-[#0A0A0B]/90 backdrop-blur-md z-50 flex flex-col items-center justify-center font-mono space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin shadow-[0_0_20px_rgba(6,182,212,0.6)]" />
          <div className="text-sm font-bold text-white uppercase tracking-wider">{switchProgressText}</div>
          <div className="text-xs text-cyan-400">CHAKRA Intelligence Synchronization Engine</div>
        </div>
      )}

      {/* Global Header */}
      <Header
        activeCase={activeCase}
        entities={entities}
        onSelectEntity={handleSelectEntity}
        onOpenIngestion={() => setIsIngestionOpen(true)}
        onOpenResolution={() => setIsResolutionOpen(true)}
        onSelectCase={handleSelectCase}
      />

      {/* Main Body with Sidebar & View Router */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          unreadAlertsCount={alerts.length}
        />

        {/* Dynamic Views */}
        {activeTab === 'overview' && (
          <OverviewDashboard
            activeCase={activeCase}
            entities={entities}
            alerts={alerts}
            onSelectEntity={(id) => setSelectedEntityId(id)}
            onNavigate={(tab) => setActiveTab(tab)}
            onRunDemoAnalysis={() => setActiveTab('network')}
          />
        )}

        {(activeTab === 'investigations' || activeTab === 'network') && (
          <InvestigationWorkspace
            entities={entities}
            relationships={relationships}
            selectedEntityId={selectedEntityId}
            onSelectEntity={(id) => setSelectedEntityId(id)}
          />
        )}

        {activeTab === 'reasoning' && (
          <ReasoningView
            entities={entities}
            relationships={relationships}
            evidenceSources={evidenceSources}
            activeCaseNumber={activeCase.caseNumber}
            onAddTask={(task) => addTask(task)}
          />
        )}

        {activeTab === 'tasks' && (
          <TaskManagementView
            tasks={tasks}
            onAddTask={(task) => addTask(task)}
            onUpdateTaskStatus={(id, status) => updateTaskStatus(id, status)}
          />
        )}

        {activeTab === 'team' && (
          <ErrorBoundary fallbackTitle="Case Team View Error">
            <TeamCollaborationView
              activeCase={activeCase}
              officers={caseOfficers}
              auditLogs={auditLogs}
            />
          </ErrorBoundary>
        )}

        {activeTab === 'related' && (
          <ErrorBoundary fallbackTitle="Related Cases View Error">
            <RelatedCasesView
              activeCase={activeCase}
              relatedCases={relatedCases}
              investigationGroups={[
                {
                  groupId: 'grp-1',
                  groupName: 'Maharashtra Inter-State Syndicate',
                  relatedCasesCount: 3,
                  stats: { people: 14, vehicles: 5, locations: 8, organizations: 3 }
                },
                {
                  groupId: 'grp-2',
                  groupName: 'Corporate Shell & Cyber Scam Syndicate',
                  relatedCasesCount: 2,
                  stats: { people: 8, vehicles: 2, locations: 4, organizations: 6 }
                }
              ]}
              onToggleLinkCase={(id) => toggleLinkCase(id)}
            />
          </ErrorBoundary>
        )}

        {activeTab === 'heatmap' && (
          <HistoricalHeatmapView entities={entities} />
        )}

        {activeTab === 'roadmap' && (
          <AiRoadmapView
            activeCase={activeCase}
            roadmapSteps={roadmapSteps}
            onUpdateStepStatus={(stepId, status) => updateRoadmapStepStatus(stepId, status)}
            onNavigateModule={(mod) => {
              if (mod === 'network') setActiveTab('network');
              else if (mod === 'evidence') setActiveTab('evidence');
              else if (mod === 'entities') setActiveTab('entities');
              else if (mod === 'alerts') setActiveTab('alerts');
              else if (mod === 'analytics') setActiveTab('analytics');
              else if (mod === 'heatmap') setActiveTab('heatmap');
            }}
          />
        )}

        {activeTab === 'entities' && (
          <EntitiesView
            entities={entities}
            onSelectEntity={(id) => handleSelectEntity(id)}
            onNavigateToNetwork={() => setActiveTab('network')}
          />
        )}

        {activeTab === 'alerts' && (
          <AlertsView
            alerts={alerts}
            entities={entities}
            onSelectEntity={(id) => handleSelectEntity(id)}
            onNavigateToNetwork={() => setActiveTab('network')}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            entities={entities}
          />
        )}

        {activeTab === 'evidence' && (
          <EvidenceView evidenceSources={evidenceSources} />
        )}

        {activeTab === 'reports' && (
          <ReportsView
            activeCase={activeCase}
            entities={entities}
            alerts={alerts}
            reports={reports}
            onAddReport={(rep) => addReport(rep)}
            onDeleteReport={(id) => deleteReport(id)}
          />
        )}

        {activeTab === 'translate' && (
          <TranslatorView />
        )}

        {activeTab === 'admin' && (
          <AdminPortalView auditLogs={auditLogs} />
        )}
      </div>

      <FooterDisclaimer />

      {/* Modals */}
      {isIngestionOpen && (
        <DataIngestionModal 
          isOpen={isIngestionOpen}
          onClose={() => setIsIngestionOpen(false)}
          onOpenResolution={() => {
            setIsIngestionOpen(false);
            setIsResolutionOpen(true);
          }}
        />
      )}

      {isResolutionOpen && (
        <EntityResolutionModal 
          isOpen={isResolutionOpen}
          onClose={() => setIsResolutionOpen(false)} 
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <IntelligenceProvider>
          <MainAppContent />
        </IntelligenceProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getTelemetryDataset } from './data/telemetryDataset';
import { SCENARIO_PHASES } from './data/scenarioPhases';
import { executeKQLQuery } from './lib/kqlEngine';
import { buildProcessTrees } from './lib/processTree';
import { evaluateStudentDebriefDeterministic } from './lib/shiftLeadEngine';
import { 
  NormalizedLogEvent, 
  PinnedIOC, 
  DebriefMessage, 
  IOCType, 
  KQLQueryResult 
} from './types/telemetry';

import { Header } from './components/Header';
import { KQLSearchBar } from './components/KQLSearchBar';
import { TelemetryTable } from './components/TelemetryTable';
import { CellFilterPopover, CellActionTarget } from './components/CellFilterPopover';
import { EventDetailDrawer } from './components/EventDetailDrawer';
import { ProcessTreeVisualizer } from './components/ProcessTreeVisualizer';
import { ShiftLeadDebriefPanel } from './components/ShiftLeadDebriefPanel';
import { IOCPinboard } from './components/IOCPinboard';
import { MitreMatrixModal } from './components/MitreMatrixModal';
import { KqlCheatSheetModal } from './components/KqlCheatSheetModal';
import { DossierExportModal } from './components/DossierExportModal';
import { SettingsModal } from './components/SettingsModal';
import { WelcomeBanner } from './components/WelcomeBanner';
import { TourOverviewModal } from './components/TourOverviewModal';

export default function App() {
  // Load static high-fidelity telemetry dataset (instant, in-memory)
  const allEvents = useMemo(() => getTelemetryDataset(), []);
  const processTrees = useMemo(() => buildProcessTrees(allEvents), [allEvents]);

  // State: Navigation & Phase Tracking
  const [currentPhaseId, setCurrentPhaseId] = useState<number>(() => {
    const saved = localStorage.getItem('opensoc_current_phase');
    return saved ? parseInt(saved, 10) : 1;
  });

  const [unlockedPhaseId, setUnlockedPhaseId] = useState<number>(() => {
    const saved = localStorage.getItem('opensoc_unlocked_phase');
    return saved ? parseInt(saved, 10) : 1;
  });

  const [activeTab, setActiveTab] = useState<'siem' | 'process_tree' | 'evidence' | 'mitre'>('siem');

  // State: KQL Query Engine
  const [kqlQuery, setKqlQuery] = useState<string>('DeviceProcessEvents');
  const [queryResult, setQueryResult] = useState<KQLQueryResult>(() =>
    executeKQLQuery(allEvents, 'DeviceProcessEvents')
  );
  const [queryHistory, setQueryHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem('opensoc_query_history');
    return saved ? JSON.parse(saved) : [
      'DeviceProcessEvents',
      'Sysmon | where EventID == 1',
      'SecurityAlert | where Severity in ("high", "critical")',
    ];
  });

  // State: Evidence & IOC Pinboard
  const [pinnedIOCs, setPinnedIOCs] = useState<PinnedIOC[]>(() => {
    const saved = localStorage.getItem('opensoc_pinned_iocs');
    return saved ? JSON.parse(saved) : [];
  });

  const [notes, setNotes] = useState<string>(() => {
    const saved = localStorage.getItem('opensoc_notes');
    return saved || '';
  });

  // State: Shift Lead Chat & Debrief
  const [messages, setMessages] = useState<DebriefMessage[]>(() => {
    const saved = localStorage.getItem('opensoc_debrief_messages');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'msg-init-1',
        sender: 'shift_lead',
        text: `Welcome to the watch floor, Analyst. I'm Alex Mercer, your SOC Shift Lead.\n\nWe have an active P1 alert on WKSTN-CORP-014. User Marcus Jenkins (CORP\\mjenkins) reported suspicious Office behavior, and our EDR flagged anomalous child process execution.\n\nReview the Phase 1 briefing in the Objectives tab, run your KQL queries, and when you've reconstructed the initial execution chain, submit your debrief here to validate the phase gate. Let's get to work!`,
        timestamp: '09:16 UTC',
      },
    ];
  });

  const [isLoading, setIsLoading] = useState(false);
  const [aiEngineStatus, setAiEngineStatus] = useState<'gemini-3.8-flash' | 'deterministic-socratic'>(
    'deterministic-socratic'
  );

  // State: Drawers & Modals
  const [selectedEvent, setSelectedEvent] = useState<NormalizedLogEvent | null>(null);
  const [cellActionTarget, setCellActionTarget] = useState<CellActionTarget | null>(null);
  const [isCheatSheetOpen, setIsCheatSheetOpen] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTourModalOpen, setIsTourModalOpen] = useState(false);
  const [toastNotification, setToastNotification] = useState<string | null>(null);

  // Check Backend Status & Available AI Engine
  useEffect(() => {
    fetch('/api/status')
      .then(res => res.json())
      .then(data => {
        if (data.hasGeminiKey) {
          setAiEngineStatus('gemini-3.8-flash');
        } else {
          setAiEngineStatus('deterministic-socratic');
        }
      })
      .catch(() => {
        setAiEngineStatus('deterministic-socratic');
      });
  }, []);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('opensoc_current_phase', currentPhaseId.toString());
  }, [currentPhaseId]);

  useEffect(() => {
    localStorage.setItem('opensoc_unlocked_phase', unlockedPhaseId.toString());
  }, [unlockedPhaseId]);

  useEffect(() => {
    localStorage.setItem('opensoc_pinned_iocs', JSON.stringify(pinnedIOCs));
  }, [pinnedIOCs]);

  useEffect(() => {
    localStorage.setItem('opensoc_notes', notes);
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('opensoc_debrief_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('opensoc_query_history', JSON.stringify(queryHistory));
  }, [queryHistory]);

  const showToast = (msg: string) => {
    setToastNotification(msg);
    setTimeout(() => setToastNotification(null), 3000);
  };

  // KQL Execution
  const handleRunQuery = useCallback((queryToRun: string) => {
    const res = executeKQLQuery(allEvents, queryToRun);
    setQueryResult(res);

    if (queryToRun && queryToRun !== '*' && !queryHistory.includes(queryToRun)) {
      setQueryHistory(prev => [queryToRun, ...prev.slice(0, 15)]);
    }
  }, [allEvents, queryHistory]);

  const handleClearQuery = () => {
    setKqlQuery('*');
    handleRunQuery('*');
  };

  // Cell quick actions
  const handleFilterInclude = (fieldName: string, value: string) => {
    const newQuery = kqlQuery.trim() === '*' || !kqlQuery.trim()
      ? `* | where ${fieldName} == "${value}"`
      : `${kqlQuery} | where ${fieldName} == "${value}"`;
    setKqlQuery(newQuery);
    handleRunQuery(newQuery);
    showToast(`Filtered to ${fieldName} == "${value}"`);
  };

  const handleFilterExclude = (fieldName: string, value: string) => {
    const newQuery = kqlQuery.trim() === '*' || !kqlQuery.trim()
      ? `* | where ${fieldName} != "${value}"`
      : `${kqlQuery} | where ${fieldName} != "${value}"`;
    setKqlQuery(newQuery);
    handleRunQuery(newQuery);
    showToast(`Excluded ${fieldName} == "${value}"`);
  };

  const handlePinIOC = (type: IOCType, value: string, iocNotes?: string) => {
    if (pinnedIOCs.some(i => i.value.toLowerCase() === value.toLowerCase())) {
      showToast(`Indicator "${value}" already pinned.`);
      return;
    }

    const newIOC: PinnedIOC = {
      id: `ioc-${Date.now()}`,
      type,
      value,
      notes: iocNotes,
      phaseDiscovered: currentPhaseId,
      timestamp: new Date().toLocaleTimeString(),
    };

    setPinnedIOCs(prev => [newIOC, ...prev]);
    showToast(`Pinned ${type.toUpperCase()}: ${value}`);
  };

  const handleRemoveIOC = (id: string) => {
    setPinnedIOCs(prev => prev.filter(i => i.id !== id));
  };

  // Shift Lead Message & Debrief Handling
  const handleSendMessage = async (text: string) => {
    const studentMsg: DebriefMessage = {
      id: `msg-${Date.now()}`,
      sender: 'student',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, studentMsg]);
    setIsLoading(true);

    try {
      // First attempt server-side Gemini call
      const res = await fetch('/api/shiftlead/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phaseId: currentPhaseId,
          studentMessage: text,
          pinnedIOCs,
          notes,
          activeFilter: kqlQuery,
        }),
      });

      const data = await res.json();

      if (!data.useFallback && data.reply) {
        // Model answered successfully
        const isApproved = data.gateApproved;
        const shiftLeadMsg: DebriefMessage = {
          id: `msg-${Date.now() + 1}`,
          sender: 'shift_lead',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isGateApproval: isApproved,
        };

        setMessages(prev => [...prev, shiftLeadMsg]);

        if (isApproved) {
          const nextUnlock = Math.min(4, Math.max(unlockedPhaseId, currentPhaseId + 1));
          setUnlockedPhaseId(nextUnlock);
          showToast(`Phase Gate Approved! Phase ${nextUnlock} Unlocked.`);
        }
        setIsLoading(false);
        return;
      }
    } catch (e) {
      console.log('Using deterministic fallback engine...');
    }

    // Deterministic Rule Engine Fallback (Instant, 100% Free)
    setTimeout(() => {
      const evaluation = evaluateStudentDebriefDeterministic(
        currentPhaseId,
        text,
        pinnedIOCs,
        notes
      );

      const shiftLeadMsg: DebriefMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'shift_lead',
        text: evaluation.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isGateApproval: evaluation.gateApproved,
        score: evaluation.score,
        suggestions: evaluation.suggestions,
      };

      setMessages(prev => [...prev, shiftLeadMsg]);

      if (evaluation.gateApproved) {
        const nextUnlock = Math.min(4, Math.max(unlockedPhaseId, currentPhaseId + 1));
        setUnlockedPhaseId(nextUnlock);
        showToast(`Phase Gate Approved! Phase ${nextUnlock} Unlocked.`);
      }

      setIsLoading(false);
    }, 400);
  };

  const handleAdvancePhase = () => {
    if (currentPhaseId < 4) {
      const nextId = currentPhaseId + 1;
      setCurrentPhaseId(nextId);
      if (nextId > unlockedPhaseId) {
        setUnlockedPhaseId(nextId);
      }

      // Add a greeting message for the new phase
      const nextPhase = SCENARIO_PHASES.find(p => p.id === nextId);
      if (nextPhase) {
        setMessages(prev => [
          ...prev,
          {
            id: `msg-${Date.now()}`,
            sender: 'shift_lead',
            text: `Advancing to ${nextPhase.code}: ${nextPhase.title}.\n\n${nextPhase.briefing}\n\nCheck the Objectives tab for key forensic goals. Happy hunting!`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    }
  };

  const handleResetInvestigation = () => {
    if (window.confirm('Reset incident investigation back to Phase 1? Pinned IOCs and notes will be cleared.')) {
      localStorage.removeItem('opensoc_current_phase');
      localStorage.removeItem('opensoc_unlocked_phase');
      localStorage.removeItem('opensoc_pinned_iocs');
      localStorage.removeItem('opensoc_notes');
      localStorage.removeItem('opensoc_debrief_messages');
      localStorage.removeItem('opensoc_query_history');

      setCurrentPhaseId(1);
      setUnlockedPhaseId(1);
      setPinnedIOCs([]);
      setNotes('');
      setKqlQuery('DeviceProcessEvents');
      handleRunQuery('DeviceProcessEvents');
      setMessages([
        {
          id: 'msg-init-reset',
          sender: 'shift_lead',
          text: `Investigation reset. Review the Phase 1 briefing, examine the telemetry on WKSTN-CORP-014, and reconstruct the initial execution chain.`,
          timestamp: '09:16 UTC',
        },
      ]);
      showToast('Investigation state reset.');
    }
  };

  const activePhase = SCENARIO_PHASES.find(p => p.id === currentPhaseId) || SCENARIO_PHASES[0];

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100 font-sans overflow-hidden">
      {/* Platform Header */}
      <Header
        phases={SCENARIO_PHASES}
        currentPhaseId={currentPhaseId}
        unlockedPhaseId={unlockedPhaseId}
        onSelectPhase={id => setCurrentPhaseId(id)}
        aiEngineStatus={aiEngineStatus}
        onOpenCheatSheet={() => setIsCheatSheetOpen(true)}
        onOpenProcessTree={() => setActiveTab('process_tree')}
        onOpenMitre={() => setActiveTab('mitre')}
        onOpenDossier={() => setIsDossierOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenWelcomeTour={() => setIsTourModalOpen(true)}
        onResetInvestigation={handleResetInvestigation}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pinnedIocCount={pinnedIOCs.length}
      />

      {/* Welcome & Faculty Briefing Banner */}
      <WelcomeBanner
        onRunSampleQuery={q => {
          setKqlQuery(q);
          handleRunQuery(q);
          setActiveTab('siem');
          showToast('Loaded Phase 1 Initial Access detection query');
        }}
        onOpenTourModal={() => setIsTourModalOpen(true)}
      />

      {/* Main Workspace with Split View (Central Tab Content + Right Shift Lead Panel) */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Main Central Viewport */}
        <div className="flex-1 flex flex-col min-h-0 bg-zinc-950 overflow-hidden">
          {activeTab === 'siem' && (
            <>
              {/* KQL Search Bar */}
              <KQLSearchBar
                query={kqlQuery}
                onQueryChange={setKqlQuery}
                onRunQuery={handleRunQuery}
                onClearQuery={handleClearQuery}
                matchedCount={queryResult.totalMatched}
                totalCount={allEvents.length}
                queryTimeMs={queryResult.queryTimeMs}
                onOpenCheatSheet={() => setIsCheatSheetOpen(true)}
                queryHistory={queryHistory}
              />

              {/* SIEM Telemetry Event Table */}
              <TelemetryTable
                events={queryResult.events}
                queryResult={queryResult}
                onSelectEvent={evt => setSelectedEvent(evt)}
                onCellClick={target => setCellActionTarget(target)}
                onPinIOC={handlePinIOC}
              />
            </>
          )}

          {activeTab === 'process_tree' && (
            <ProcessTreeVisualizer
              processTrees={processTrees}
              onSelectEventById={id => {
                const found = allEvents.find(e => e.id === id);
                if (found) setSelectedEvent(found);
              }}
              onPinIOC={handlePinIOC}
            />
          )}

          {activeTab === 'evidence' && (
            <IOCPinboard
              pinnedIOCs={pinnedIOCs}
              onRemoveIOC={handleRemoveIOC}
              onAddIOC={handlePinIOC}
              notes={notes}
              onNotesChange={setNotes}
              onExportDossier={() => setIsDossierOpen(true)}
            />
          )}

          {activeTab === 'mitre' && (
            <MitreMatrixModal
              onFilterTechnique={techId => {
                const newQ = `* | where technique_id == "${techId}" or raw_message contains "${techId}"`;
                setKqlQuery(newQ);
                handleRunQuery(newQ);
                setActiveTab('siem');
                showToast(`Filtered SIEM to ATT&CK Technique ${techId}`);
              }}
            />
          )}
        </div>

        {/* AI Shift Lead Interactive Debrief & Guidance Panel */}
        <ShiftLeadDebriefPanel
          currentPhase={activePhase}
          unlockedPhaseId={unlockedPhaseId}
          onAdvancePhase={handleAdvancePhase}
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          pinnedIOCs={pinnedIOCs}
          notes={notes}
          aiEngineStatus={aiEngineStatus}
        />
      </div>

      {/* Popovers & Drawers */}
      <CellFilterPopover
        target={cellActionTarget}
        onClose={() => setCellActionTarget(null)}
        onFilterInclude={handleFilterInclude}
        onFilterExclude={handleFilterExclude}
        onPinIOC={handlePinIOC}
      />

      <EventDetailDrawer
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onPinIOC={handlePinIOC}
        onFilterField={handleFilterInclude}
      />

      <KqlCheatSheetModal
        isOpen={isCheatSheetOpen}
        onClose={() => setIsCheatSheetOpen(false)}
        onApplyQuery={q => {
          setKqlQuery(q);
          handleRunQuery(q);
          setActiveTab('siem');
          showToast(`Applied KQL query.`);
        }}
      />

      <DossierExportModal
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        phases={SCENARIO_PHASES}
        unlockedPhaseId={unlockedPhaseId}
        pinnedIOCs={pinnedIOCs}
        notes={notes}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        aiEngineStatus={aiEngineStatus}
        onResetInvestigation={handleResetInvestigation}
        pinnedIocCount={pinnedIOCs.length}
      />

      <TourOverviewModal
        isOpen={isTourModalOpen}
        onClose={() => setIsTourModalOpen(false)}
        onRunSampleQuery={q => {
          setKqlQuery(q);
          handleRunQuery(q);
          setActiveTab('siem');
          showToast('Loaded Phase 1 Initial Access detection query');
        }}
      />

      {/* Toast Notification */}
      {toastNotification && (
        <div className="fixed bottom-4 left-6 z-50 bg-zinc-900 border border-cyan-500/80 text-cyan-200 px-4 py-2.5 rounded-lg shadow-xl font-mono text-xs flex items-center space-x-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>{toastNotification}</span>
        </div>
      )}
    </div>
  );
}

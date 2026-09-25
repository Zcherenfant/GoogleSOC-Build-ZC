import React, { useState, useRef, useEffect } from 'react';
import { 
  InvestigationPhase, 
  PinnedIOC, 
  DebriefMessage 
} from '../types/telemetry';
import { 
  Bot, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  ChevronRight, 
  ShieldAlert, 
  ListChecks,
  User,
  Zap,
  ArrowRight
} from 'lucide-react';
import { getShiftLeadSocraticHint } from '../lib/shiftLeadEngine';

interface ShiftLeadDebriefPanelProps {
  currentPhase: InvestigationPhase;
  unlockedPhaseId: number;
  onAdvancePhase: () => void;
  messages: DebriefMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
  pinnedIOCs: PinnedIOC[];
  notes: string;
  aiEngineStatus: 'gemini-3.8-flash' | 'deterministic-socratic';
}

export const ShiftLeadDebriefPanel: React.FC<ShiftLeadDebriefPanelProps> = ({
  currentPhase,
  unlockedPhaseId,
  onAdvancePhase,
  messages,
  onSendMessage,
  isLoading,
  pinnedIOCs,
  aiEngineStatus,
}) => {
  const [inputText, setInputText] = useState('');
  const [activeTab, setActiveTab] = useState<'debrief' | 'briefing'>('debrief');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const msg = inputText;
    setInputText('');
    await onSendMessage(msg);
  };

  const handleAskClue = () => {
    const hint = getShiftLeadSocraticHint(currentPhase.id);
    onSendMessage(`Lead Mercer, can you provide a Socratic clue for ${currentPhase.title}? Here is what I am looking at: ${hint}`);
  };

  const isCurrentPhasePassed = unlockedPhaseId > currentPhase.id;
  const isFinalPhase = currentPhase.id === 4;

  return (
    <div className="w-96 border-l border-zinc-800 bg-zinc-950 flex flex-col font-mono text-xs text-zinc-200 select-none">
      {/* Shift Lead Header */}
      <div className="p-3 border-b border-zinc-800 bg-zinc-900/90 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-cyan-950 border border-cyan-700 flex items-center justify-center text-cyan-300">
              <Bot className="w-4 h-4" />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-zinc-950" />
          </div>

          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-zinc-100 text-xs">Alex Mercer</span>
              <span className="text-[10px] text-zinc-500">(Shift Lead)</span>
            </div>
            <div className="flex items-center space-x-1 text-[10px] text-zinc-400">
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span>{aiEngineStatus === 'gemini-3.8-flash' ? 'Gemini 3.8 Flash' : 'Socratic Engine'}</span>
            </div>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-zinc-950 rounded p-0.5 border border-zinc-800 text-[11px]">
          <button
            onClick={() => setActiveTab('debrief')}
            className={`px-2 py-1 rounded transition-colors ${
              activeTab === 'debrief'
                ? 'bg-cyan-600 text-white font-medium'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Debrief
          </button>
          <button
            onClick={() => setActiveTab('briefing')}
            className={`px-2 py-1 rounded transition-colors ${
              activeTab === 'briefing'
                ? 'bg-cyan-600 text-white font-medium'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Objectives
          </button>
        </div>
      </div>

      {/* Tab: Briefing & Objectives */}
      {activeTab === 'briefing' ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Phase Badge & Threat Lore */}
          <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-cyan-400 font-bold text-xs uppercase">
                {currentPhase.code} Briefing
              </span>
              <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">
                Tier-1 Playbook
              </span>
            </div>

            <h3 className="font-bold text-sm text-zinc-100">{currentPhase.title}</h3>
            <p className="text-zinc-400 text-xs leading-relaxed whitespace-pre-line">
              {currentPhase.briefing}
            </p>

            <div className="pt-2 border-t border-zinc-800 text-[11px] text-amber-300/90 italic">
              Threat Intel Context: {currentPhase.threatActorContext}
            </div>
          </div>

          {/* Objectives Checklist */}
          <div className="space-y-2">
            <div className="flex items-center space-x-1.5 text-zinc-400 font-semibold text-xs">
              <ListChecks className="w-4 h-4 text-cyan-400" />
              <span>Phase Forensic Objectives</span>
            </div>

            <div className="space-y-2">
              {currentPhase.objectives.map((obj, i) => (
                <div
                  key={obj.id}
                  className="bg-zinc-900/60 p-2.5 rounded border border-zinc-800 space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <span className="w-4 h-4 rounded-full bg-cyan-950 text-cyan-400 flex items-center justify-center text-[10px] font-bold">
                      {i + 1}
                    </span>
                    <span className="font-semibold text-zinc-200 text-xs">
                      {obj.title}
                    </span>
                  </div>
                  <p className="text-zinc-400 text-[11px] pl-6">
                    {obj.description}
                  </p>
                  <div className="text-[10px] text-zinc-500 pl-6 pt-0.5 italic">
                    Clue: {obj.keyArtifactClue}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended KQL Queries */}
          <div className="space-y-1.5">
            <span className="text-zinc-400 font-semibold text-xs block">
              Suggested SIEM Queries for this Phase:
            </span>
            <div className="space-y-1">
              {currentPhase.recommendedQueries.map((q, idx) => (
                <code
                  key={idx}
                  className="block p-1.5 bg-zinc-900 border border-zinc-800 rounded text-[11px] text-cyan-300 font-mono break-all cursor-pointer hover:border-cyan-500 transition-colors"
                  title="Click to copy query"
                  onClick={() => navigator.clipboard.writeText(q)}
                >
                  {q}
                </code>
              ))}
            </div>
          </div>

          <button
            onClick={() => setActiveTab('debrief')}
            className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5"
          >
            <span>Proceed to Analytical Debrief</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        /* Tab: Debrief Chat & Evaluation */
        <div className="flex-1 flex flex-col min-h-0">
          {/* Phase status indicator */}
          <div className="p-2.5 bg-zinc-900/40 border-b border-zinc-800 flex items-center justify-between text-[11px]">
            <span className="text-zinc-400">
              Evaluating: <strong className="text-zinc-200">{currentPhase.title}</strong>
            </span>

            {isCurrentPhasePassed ? (
              <span className="flex items-center space-x-1 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Gate Approved</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1 text-amber-400 font-semibold">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Gate Pending</span>
              </span>
            )}
          </div>

          {/* Chat Messages Stream */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.length === 0 ? (
              <div className="py-8 text-center text-zinc-500 space-y-3">
                <Bot className="w-8 h-8 mx-auto text-zinc-600" />
                <div className="space-y-1">
                  <p className="text-zinc-300 font-semibold text-xs">Ready for your Debrief, Analyst.</p>
                  <p className="text-zinc-500 text-[11px] leading-relaxed">
                    Explain your findings for {currentPhase.code}: what happened, which processes or IPs were involved, and what evidence supports your conclusion.
                  </p>
                </div>
                <button
                  onClick={handleAskClue}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-cyan-400 rounded text-xs transition-colors"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Request Socratic Clue</span>
                </button>
              </div>
            ) : (
              messages.map(msg => {
                const isStudent = msg.sender === 'student';

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col space-y-1 ${isStudent ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center space-x-1.5 text-[10px] text-zinc-500 px-1">
                      {isStudent ? (
                        <>
                          <span>You (Analyst)</span>
                          <User className="w-3 h-3 text-cyan-400" />
                        </>
                      ) : (
                        <>
                          <Bot className="w-3 h-3 text-purple-400" />
                          <span className="text-purple-300 font-semibold">Alex Mercer</span>
                        </>
                      )}
                      <span>•</span>
                      <span>{msg.timestamp}</span>
                    </div>

                    <div
                      className={`p-3 rounded-lg text-xs leading-relaxed max-w-[90%] whitespace-pre-wrap break-words ${
                        isStudent
                          ? 'bg-cyan-950/80 border border-cyan-700/80 text-cyan-100'
                          : msg.isGateApproval
                          ? 'bg-emerald-950/80 border border-emerald-600/80 text-emerald-100'
                          : 'bg-zinc-900 border border-zinc-800 text-zinc-200'
                      }`}
                    >
                      {msg.isGateApproval && (
                        <div className="flex items-center space-x-1.5 text-emerald-400 font-bold mb-2 pb-1.5 border-b border-emerald-800/80 text-xs">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>PHASE GATE VALIDATED & APPROVED</span>
                        </div>
                      )}

                      {msg.text}

                      {/* Advance Phase Button inside message card if passed */}
                      {msg.isGateApproval && !isFinalPhase && (
                        <div className="mt-3 pt-2 border-t border-emerald-800/60">
                          <button
                            onClick={onAdvancePhase}
                            className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-950 transition-colors"
                          >
                            <span>Advance to Next Phase</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {isLoading && (
              <div className="flex items-start space-x-2 text-zinc-400 text-xs">
                <Bot className="w-4 h-4 text-purple-400 animate-spin" />
                <span className="italic">Shift Lead Mercer is analyzing your forensic deduction...</span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Quick Guidance Clue Bar */}
          <div className="px-3 py-1.5 bg-zinc-900/60 border-t border-zinc-800/80 flex items-center justify-between text-[11px]">
            <button
              onClick={handleAskClue}
              className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
            >
              <HelpCircle className="w-3 h-3" />
              <span>Ask Shift Lead for a Clue</span>
            </button>
            <span className="text-zinc-500">
              Pinned IOCs: <strong className="text-zinc-300">{pinnedIOCs.length}</strong>
            </span>
          </div>

          {/* Debrief Input Form */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-zinc-800 bg-zinc-900">
            <div className="relative">
              <textarea
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder={`Submit analytical debrief for ${currentPhase.code}...\n(Detail what happened, parent/child processes, hashes, or C2 IPs)`}
                rows={3}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-md p-2.5 pr-10 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-mono resize-none"
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />

              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="absolute right-2 bottom-2 p-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Send Debrief (Enter)"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center justify-between mt-1 text-[10px] text-zinc-500">
              <span>Press <strong>Enter</strong> to submit debrief • <strong>Shift+Enter</strong> for newline</span>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

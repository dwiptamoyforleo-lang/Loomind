import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Copy,
  Check,
  Bookmark,
  RefreshCw,
  Volume2,
  VolumeX,
  Layers,
  ArrowUpRight,
  Info,
  ChevronDown,
  FileText,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage, ResearchSource, CitationRef } from '../../types';

interface ChatWorkspaceProps {
  messages: ChatMessage[];
  sources: ResearchSource[];
  notebookTitle: string;
  onSendMessage: (text: string) => void;
  onRegenerate: (messageId: string) => void;
  onSaveMessageToStudio: (message: ChatMessage) => void;
  onPreviewSourceById: (sourceId: string) => void;
  onOpenAddSource: () => void;
  isLoading: boolean;
}

export const ChatWorkspace: React.FC<ChatWorkspaceProps> = ({
  messages,
  sources,
  notebookTitle,
  onSendMessage,
  onRegenerate,
  onSaveMessageToStudio,
  onPreviewSourceById,
  onOpenAddSource,
  isLoading,
}) => {
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeSources = sources.filter((s) => s.isSelected);

  // Auto-scroll when messages update or loading
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = () => {
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText.trim());
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSave = (msg: ChatMessage) => {
    onSaveMessageToStudio(msg);
    setSavedId(msg.id);
    setTimeout(() => setSavedId(null), 2000);
  };

  const handleSpeak = (id: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    setSpeakingId(id);
    // strip markdown for speech
    const cleanText = text.replace(/[#*`_~[\]]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    window.speechSynthesis.speak(utterance);
  };

  // Pre-configured intelligent research queries
  const suggestedQueries = [
    'Synthesize the core empirical findings across my active sources.',
    'What are the primary theoretical thresholds or operational limits identified?',
    'Compare the methodologies used and evaluate any acknowledged constraints.',
    'Identify conflicting conclusions or points of divergence between these documents.',
  ];

  return (
    <main className="flex-1 h-full flex flex-col bg-slate-50/50 dark:bg-slate-950 min-w-0 relative">
      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Welcome / Empty state */}
        {messages.length === 0 && (
          <div className="max-w-2xl mx-auto pt-8 pb-12 space-y-6 animate-in fade-in duration-300">
            <div className="text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Research & Synthesis Assistant
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
                Ask questions grounded strictly in your attached literature. Every factual claim is cross-referenced with citation markers.
              </p>
            </div>

            {/* Active Sources Status Card */}
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  Active Knowledge Base ({activeSources.length} of {sources.length})
                </span>
                {activeSources.length === 0 && (
                  <button
                    onClick={onOpenAddSource}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    + Add Documents
                  </button>
                )}
              </div>

              {activeSources.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {activeSources.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => onPreviewSourceById(s.id)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-[11px] font-medium text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        [{s.citationIndex}]
                      </span>
                      <span className="truncate max-w-[200px]">{s.title}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  ⚠️ No sources are currently active. Attach or select sources from the left panel to ground the AI.
                </p>
              )}
            </div>

            {/* Suggested Starter Prompts */}
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
                Suggested Research Inquiries
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {suggestedQueries.map((query, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSendMessage(query)}
                    className="p-3 text-left rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-xs transition-all text-xs text-slate-700 dark:text-slate-300 group cursor-pointer"
                  >
                    <span className="font-medium group-hover:text-indigo-600 dark:group-hover:text-indigo-400 line-clamp-2">
                      {query}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Render Message List */}
        {messages.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl mx-auto ${
                isUser ? 'justify-end' : 'justify-start'
              }`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}

              <div
                className={`rounded-2xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-indigo-600 text-white shadow-sm max-w-xl'
                    : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 shadow-xs flex-1 min-w-0'
                }`}
              >
                {/* Markdown content */}
                <div className={`prose prose-xs sm:prose-sm dark:prose-invert max-w-none ${isUser ? 'text-white' : ''}`}>
                  <ReactMarkdown
                    components={{
                      // Custom citation click detection in Markdown
                      p: ({ node, children, ...props }) => {
                        return <p className="mb-2 last:mb-0" {...props}>{children}</p>;
                      },
                      code: ({ node, ...props }) => (
                        <code className="bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 px-1.5 py-0.5 rounded font-mono text-xs" {...props} />
                      ),
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>

                {/* Grounded Citations Bar */}
                {!isUser && msg.citations && msg.citations.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Referenced Literature ({msg.citations.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.citations.map((c) => (
                        <button
                          key={c.index}
                          onClick={() => onPreviewSourceById(c.sourceId)}
                          className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 text-[10px] font-semibold border border-indigo-200/80 dark:border-indigo-800 flex items-center gap-1 cursor-pointer transition-colors"
                          title={`Open source: ${c.sourceTitle}`}
                        >
                          <span>[{c.index}]</span>
                          <span className="truncate max-w-[160px]">{c.sourceTitle}</span>
                          <ArrowUpRight className="w-2.5 h-2.5" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Assistant Message Actions Toolbar */}
                {!isUser && (
                  <div className="mt-3 pt-2 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="p-1 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                        title="Copy to clipboard"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        onClick={() => handleSave(msg)}
                        className="p-1 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                        title="Save to Studio / Notes"
                      >
                        {savedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Bookmark className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        onClick={() => handleSpeak(msg.id, msg.content)}
                        className="p-1 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                        title={speakingId === msg.id ? 'Stop audio' : 'Listen via audio'}
                      >
                        {speakingId === msg.id ? (
                          <VolumeX className="w-3.5 h-3.5 text-indigo-500" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        onClick={() => onRegenerate(msg.id)}
                        className="p-1 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                        title="Regenerate synthesis"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 max-w-3xl mx-auto">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
              <span>Analyzing {activeSources.length} sources and synthesizing grounded insights...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Composer Input Area */}
      <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-10 shrink-0">
        <div className="max-w-3xl mx-auto">
          {/* Grounding context info bar */}
          <div className="flex items-center justify-between px-2 pb-2 text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>
                Grounded in{' '}
                <strong className="text-slate-700 dark:text-slate-300 font-bold">
                  {activeSources.length} sources
                </strong>
              </span>
            </div>
            <span className="text-[10px] text-slate-400 hidden sm:inline">
              Press Enter to send, Shift+Enter for newline
            </span>
          </div>

          <div className="relative flex items-end gap-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-1.5 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/20 transition-all">
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
              }}
              onKeyDown={handleKeyDown}
              placeholder={
                activeSources.length > 0
                  ? `Ask questions about ${notebookTitle}...`
                  : 'Add or select sources to ground your questions...'
              }
              className="flex-1 bg-transparent border-none text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 px-2.5 py-1.5 focus:outline-none resize-none max-h-40"
            />

            <button
              onClick={handleSend}
              disabled={!inputText.trim() || isLoading}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
              title="Send research query"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

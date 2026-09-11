import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  BookOpen,
  FileText,
  HelpCircle,
  Clock,
  Key,
  Edit3,
  Headphones,
  Bookmark,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Play,
  Pause,
  Volume2,
  ChevronDown,
  ChevronUp,
  Download,
  Share2,
  Copy,
  Check,
  Award,
  Layers,
  Save,
  Trash2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  StudioToolType,
  ResearchSource,
  StudioSavedItem,
  QuizQuestion,
  Flashcard,
  AudioOverviewData,
  SummaryData,
  StudyGuideData,
  TimelineEvent,
  KeyConceptItem,
  FaqItem,
} from '../../types';
import { generateStudioTool } from '../../utils/api';
import { speechOverviewPlayer } from '../../utils/audioSpeech';

interface StudioPanelProps {
  sources: ResearchSource[];
  notebookTitle: string;
  savedItems: StudioSavedItem[];
  onSaveItem: (item: Omit<StudioSavedItem, 'id' | 'createdAt'>) => void;
  onDeleteItem: (id: string) => void;
}

export const StudioPanel: React.FC<StudioPanelProps> = ({
  sources,
  notebookTitle,
  savedItems,
  onSaveItem,
  onDeleteItem,
}) => {
  const [activeTool, setActiveTool] = useState<StudioToolType | null>(null);
  const [loadingTool, setLoadingTool] = useState<StudioToolType | null>(null);
  const [toolData, setToolData] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // Interactive Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [showQuizResults, setShowQuizResults] = useState(false);

  // Interactive Flashcards state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [masteredCardIds, setMasteredCardIds] = useState<Set<string>>(new Set());

  // Audio Overview player state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeAudioTurn, setActiveAudioTurn] = useState<number>(0);
  const [audioSpeed, setAudioSpeed] = useState<number>(1.0);

  // Scratchpad Notes state
  const [scratchpadNotes, setScratchpadNotes] = useState(
    '### Research Synthesis Notes\n\n- Key observations recorded during literature review:\n  1. Review fault-tolerant error budgets\n  2. Re-verify post-quantum algorithm migration roadmap'
  );

  // FAQ Accordion state
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(0);

  const activeSources = sources.filter((s) => s.isSelected);

  const toolsList: Array<{
    type: StudioToolType;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }> = [
    {
      type: 'summary',
      label: 'Executive Summary',
      description: 'Comprehensive multi-source executive synthesis and key findings.',
      icon: BookOpen,
      color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/60',
    },
    {
      type: 'study-guide',
      label: 'Study Guide',
      description: 'Learning objectives, core theorems, review questions, and glossary.',
      icon: FileText,
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/60',
    },
    {
      type: 'quiz',
      label: 'Interactive Quiz',
      description: 'Challenge your knowledge with scored questions and citation explanations.',
      icon: HelpCircle,
      color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/60',
    },
    {
      type: 'flashcards',
      label: 'Interactive Flashcards',
      description: 'Active recall flashcards with 3D flip and spaced mastery tracking.',
      icon: Layers,
      color: 'text-violet-500 bg-violet-50 dark:bg-violet-950/60',
    },
    {
      type: 'audio-overview',
      label: 'Audio Overview',
      description: 'Dual-speaker podcast deep-dive briefing with natural speech synthesis.',
      icon: Headphones,
      color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/60',
    },
    {
      type: 'faq',
      label: 'FAQ Synthesis',
      description: 'Answers to the most critical technical questions from the papers.',
      icon: HelpCircle,
      color: 'text-sky-500 bg-sky-50 dark:bg-sky-950/60',
    },
    {
      type: 'timeline',
      label: 'Timeline & Milestones',
      description: 'Chronological progression, historical milestones, and future roadmaps.',
      icon: Clock,
      color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/60',
    },
    {
      type: 'key-concepts',
      label: 'Key Concepts',
      description: 'Deep definitional breakdowns and key mechanisms.',
      icon: Key,
      color: 'text-teal-500 bg-teal-50 dark:bg-teal-950/60',
    },
    {
      type: 'notes',
      label: 'Research Notes',
      description: 'Personal markdown scratchpad to capture insights alongside sources.',
      icon: Edit3,
      color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/60',
    },
    {
      type: 'saved-responses',
      label: 'Saved Library',
      description: 'View and export previously bookmarked studio outputs.',
      icon: Bookmark,
      color: 'text-slate-500 bg-slate-50 dark:bg-slate-800',
    },
  ];

  const handleLaunchTool = async (type: StudioToolType) => {
    if (type === 'notes') {
      setActiveTool('notes');
      return;
    }
    if (type === 'saved-responses') {
      setActiveTool('saved-responses');
      return;
    }

    setLoadingTool(type);
    setActiveTool(type);
    // Reset tool interactive states
    setQuizAnswers({});
    setShowQuizResults(false);
    setCurrentCardIndex(0);
    setIsCardFlipped(false);
    speechOverviewPlayer.stop();
    setIsPlayingAudio(false);

    try {
      const response = await generateStudioTool(type, activeSources, notebookTitle);
      setToolData(response.data);

      if (type === 'audio-overview' && response.data.dialogue) {
        speechOverviewPlayer.setDialogue(
          response.data.dialogue,
          (idx) => setActiveAudioTurn(idx),
          () => setIsPlayingAudio(false)
        );
      }
    } catch (e) {
      console.error('Tool generation error:', e);
    } finally {
      setLoadingTool(null);
    }
  };

  const handleSaveCurrentTool = () => {
    if (!activeTool || !toolData) return;
    const title = `${activeTool.toUpperCase()} — ${notebookTitle}`;
    onSaveItem({
      notebookId: activeSources[0]?.notebookId || '',
      toolType: activeTool,
      title,
      data: toolData,
      tags: [activeTool, 'Studio Generated'],
    });
  };

  const handleCopyText = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Audio Overview Handlers
  const togglePlayAudio = () => {
    if (isPlayingAudio) {
      speechOverviewPlayer.pause();
      setIsPlayingAudio(false);
    } else {
      speechOverviewPlayer.setRate(audioSpeed);
      speechOverviewPlayer.play(activeAudioTurn);
      setIsPlayingAudio(true);
    }
  };

  const handleSpeedChange = (newSpeed: number) => {
    setAudioSpeed(newSpeed);
    speechOverviewPlayer.setRate(newSpeed);
  };

  // Quiz submission & Confetti
  const handleQuizAnswerSelect = (qIndex: number, optionIndex: number) => {
    if (showQuizResults) return;
    setQuizAnswers((prev) => ({ ...prev, [qIndex]: optionIndex }));
  };

  const handleFinishQuiz = () => {
    setShowQuizResults(true);
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 },
    });
  };

  return (
    <aside className="w-full md:w-80 lg:w-96 h-full flex flex-col bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shrink-0 select-none">
      {/* Panel Top Header */}
      <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Studio & Artifacts
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Generative academic study tools
            </p>
          </div>
        </div>

        {activeTool && (
          <button
            onClick={() => {
              speechOverviewPlayer.stop();
              setIsPlayingAudio(false);
              setActiveTool(null);
            }}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>All Tools</span>
          </button>
        )}
      </div>

      {/* Main Tool Launcher Grid (When no tool is active) */}
      {!activeTool && (
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
            Synthesis Tools ({activeSources.length} sources active)
          </p>

          <div className="grid grid-cols-1 gap-2">
            {toolsList.map((tool) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.type}
                  onClick={() => handleLaunchTool(tool.type)}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-850 transition-all flex items-start gap-3 group cursor-pointer"
                >
                  <div className={`p-2 rounded-lg shrink-0 ${tool.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                        {tool.label}
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug line-clamp-2">
                      {tool.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Tool View */}
      {activeTool && (
        <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50 dark:bg-slate-950">
          {/* Tool Action Subheader */}
          <div className="px-4 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              {activeTool.replace('-', ' ')}
            </span>

            <div className="flex items-center gap-1.5">
              {toolData && (
                <>
                  <button
                    onClick={() => handleCopyText(JSON.stringify(toolData, null, 2))}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    title="Copy tool JSON data"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <button
                    onClick={handleSaveCurrentTool}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                    title="Save output to Studio"
                  >
                    <Save className="w-3.5 h-3.5" />
                  </button>
                </>
              )}

              <button
                onClick={() => handleLaunchTool(activeTool)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                title="Regenerate"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loadingTool && (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <Sparkles className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin mb-3" />
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Synthesizing {loadingTool.replace('-', ' ')}...
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                Analyzing evidence from {activeSources.length} active documents.
              </p>
            </div>
          )}

          {/* Render Tool Results when loaded */}
          {!loadingTool && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs leading-relaxed text-slate-800 dark:text-slate-200">
              {/* 1. QUIZ TOOL */}
              {activeTool === 'quiz' && toolData?.questions && (
                <div className="space-y-4">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl border border-indigo-200 dark:border-indigo-900 text-indigo-900 dark:text-indigo-200 text-xs">
                    <strong>Interactive Assessment:</strong> Answer the questions below to test comprehension of your attached research.
                  </div>

                  {(toolData.questions as QuizQuestion[]).map((q, qIndex) => {
                    const selectedOpt = quizAnswers[qIndex];
                    const isAnswered = selectedOpt !== undefined;
                    const isCorrect = selectedOpt === q.correctIndex;

                    return (
                      <div
                        key={q.id || qIndex}
                        className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5"
                      >
                        <p className="font-bold text-slate-900 dark:text-white">
                          {qIndex + 1}. {q.question}
                        </p>

                        <div className="space-y-1.5 pt-1">
                          {q.options.map((opt, optIndex) => {
                            let optClasses =
                              'p-2.5 rounded-lg border text-xs text-left w-full transition-all flex items-start gap-2 cursor-pointer ';

                            if (showQuizResults) {
                              if (optIndex === q.correctIndex) {
                                optClasses +=
                                  'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-semibold';
                              } else if (selectedOpt === optIndex) {
                                optClasses +=
                                  'bg-rose-50 dark:bg-rose-950/50 border-rose-500 text-rose-900 dark:text-rose-200 line-through';
                              } else {
                                optClasses +=
                                  'border-slate-200 dark:border-slate-800 opacity-60 text-slate-500';
                              }
                            } else {
                              if (selectedOpt === optIndex) {
                                optClasses +=
                                  'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-600 text-indigo-900 dark:text-indigo-200 font-semibold';
                              } else {
                                optClasses +=
                                  'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800';
                              }
                            }

                            return (
                              <button
                                key={optIndex}
                                onClick={() => handleQuizAnswerSelect(qIndex, optIndex)}
                                className={optClasses}
                              >
                                <span className="w-4 h-4 rounded-full border flex items-center justify-center text-[10px] shrink-0">
                                  {String.fromCharCode(65 + optIndex)}
                                </span>
                                <span>{opt}</span>
                              </button>
                            );
                          })}
                        </div>

                        {showQuizResults && (
                          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
                            <span className="font-bold text-slate-700 dark:text-slate-300">
                              Explanation:
                            </span>{' '}
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {!showQuizResults ? (
                    <button
                      onClick={handleFinishQuiz}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                    >
                      Submit Quiz & Check Score
                    </button>
                  ) : (
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-200 dark:border-emerald-800 text-center">
                      <Award className="w-8 h-8 mx-auto mb-1 text-emerald-600 dark:text-emerald-400" />
                      <p className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
                        Quiz Completed!
                      </p>
                      <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
                        Score:{' '}
                        {
                          toolData.questions.filter(
                            (q: QuizQuestion, i: number) => quizAnswers[i] === q.correctIndex
                          ).length
                        }{' '}
                        / {toolData.questions.length} Correct
                      </p>
                      <button
                        onClick={() => {
                          setQuizAnswers({});
                          setShowQuizResults(false);
                        }}
                        className="mt-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 underline"
                      >
                        Retry Quiz
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* 2. FLASHCARDS TOOL */}
              {activeTool === 'flashcards' && toolData?.cards && (
                <div className="space-y-4">
                  {/* Progress bar */}
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>
                      Card {currentCardIndex + 1} of {toolData.cards.length}
                    </span>
                    <span>{masteredCardIds.size} mastered</span>
                  </div>

                  {/* 3D Flippable Card */}
                  {toolData.cards[currentCardIndex] && (
                    <div
                      onClick={() => setIsCardFlipped(!isCardFlipped)}
                      className="min-h-[220px] p-6 bg-white dark:bg-slate-900 rounded-2xl border-2 border-indigo-200 dark:border-indigo-900 shadow-lg flex flex-col justify-between text-center cursor-pointer transition-all hover:scale-[1.01]"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">
                        {isCardFlipped ? 'Answer' : 'Question (Click to flip)'}
                      </span>

                      <div className="my-auto">
                        <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-relaxed">
                          {isCardFlipped
                            ? toolData.cards[currentCardIndex].back
                            : toolData.cards[currentCardIndex].front}
                        </p>
                      </div>

                      <span className="text-[10px] text-slate-400">
                        {toolData.cards[currentCardIndex].category || 'Core Concept'}
                      </span>
                    </div>
                  )}

                  {/* Flashcard Controls */}
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        setCurrentCardIndex((prev) => Math.max(0, prev - 1));
                        setIsCardFlipped(false);
                      }}
                      disabled={currentCardIndex === 0}
                      className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-40 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        const cardId = toolData.cards[currentCardIndex]?.id || `${currentCardIndex}`;
                        setMasteredCardIds((prev) => {
                          const next = new Set(prev);
                          if (next.has(cardId)) next.delete(cardId);
                          else next.add(cardId);
                          return next;
                        });
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 cursor-pointer ${
                        masteredCardIds.has(
                          toolData.cards[currentCardIndex]?.id || `${currentCardIndex}`
                        )
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>
                        {masteredCardIds.has(
                          toolData.cards[currentCardIndex]?.id || `${currentCardIndex}`
                        )
                          ? 'Mastered'
                          : 'Mark Mastered'}
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setCurrentCardIndex((prev) =>
                          Math.min(toolData.cards.length - 1, prev + 1)
                        );
                        setIsCardFlipped(false);
                      }}
                      disabled={currentCardIndex === toolData.cards.length - 1}
                      className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-40 cursor-pointer"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* 3. AUDIO OVERVIEW TOOL */}
              {activeTool === 'audio-overview' && toolData?.dialogue && (
                <div className="space-y-4">
                  {/* Player Hero Card */}
                  <div className="p-4 bg-gradient-to-r from-rose-950 via-slate-900 to-indigo-950 text-white rounded-2xl border border-rose-900/40 shadow-md">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                        <Volume2 className="w-3 h-3" />
                        AI Deep Dive Briefing
                      </span>
                      <span className="text-xs text-slate-400">
                        ~{toolData.estimatedDurationMinutes || 4} min listen
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white mb-1">
                      {toolData.episodeTitle || 'Research Overview Podcast'}
                    </h3>
                    <p className="text-xs text-slate-300 line-clamp-2">
                      {toolData.summary}
                    </p>

                    {/* Audio Player Transport Controls */}
                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                      <button
                        onClick={togglePlayAudio}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold flex items-center gap-2 shadow-sm cursor-pointer"
                      >
                        {isPlayingAudio ? (
                          <>
                            <Pause className="w-4 h-4" />
                            <span>Pause Audio</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4" />
                            <span>Play Overview</span>
                          </>
                        )}
                      </button>

                      <div className="flex items-center gap-1 bg-slate-800/80 rounded-lg p-0.5 border border-slate-700">
                        {[1.0, 1.25, 1.5].map((spd) => (
                          <button
                            key={spd}
                            onClick={() => handleSpeedChange(spd)}
                            className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                              audioSpeed === spd
                                ? 'bg-rose-600 text-white'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            {spd}x
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Dialogue Transcript with Active Highlighting */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
                      Live Transcript (Dual Host Discussion)
                    </span>

                    <div className="space-y-2">
                      {toolData.dialogue.map((line: any, i: number) => {
                        const isAlex = line.speaker === 'Alex';
                        const isActive = activeAudioTurn === i && isPlayingAudio;

                        return (
                          <div
                            key={i}
                            className={`p-3 rounded-xl border transition-all ${
                              isActive
                                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-400 dark:border-rose-700 shadow-sm'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 mb-1">
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wider ${
                                  isAlex
                                    ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                                    : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                }`}
                              >
                                {line.speaker}
                              </span>
                            </div>
                            <p className="text-xs leading-relaxed text-slate-800 dark:text-slate-200">
                              {line.text}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* 4. SUMMARY TOOL */}
              {activeTool === 'summary' && toolData?.executiveSummary && (
                <div className="space-y-3">
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">
                      Executive Summary
                    </h4>
                    <p className="leading-relaxed">{toolData.executiveSummary}</p>
                  </div>

                  {toolData.keyHighlights && (
                    <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">
                        Key Synthesis Highlights
                      </h4>
                      <ul className="list-disc pl-4 space-y-1 text-slate-700 dark:text-slate-300">
                        {toolData.keyHighlights.map((hl: string, i: number) => (
                          <li key={i}>{hl}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* 5. STUDY GUIDE TOOL */}
              {activeTool === 'study-guide' && toolData?.learningObjectives && (
                <div className="space-y-3">
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2">
                      Learning Objectives
                    </h4>
                    <ul className="list-decimal pl-4 space-y-1">
                      {toolData.learningObjectives.map((obj: string, i: number) => (
                        <li key={i}>{obj}</li>
                      ))}
                    </ul>
                  </div>

                  {toolData.coreTheorems && (
                    <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        Core Theorems & Mechanisms
                      </h4>
                      {toolData.coreTheorems.map((thm: any, i: number) => (
                        <div key={i} className="pt-2 border-t border-slate-100 dark:border-slate-800">
                          <p className="font-bold text-slate-900 dark:text-white">{thm.concept}</p>
                          <p className="text-slate-600 dark:text-slate-400 mt-0.5">{thm.summary}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 6. FAQ TOOL */}
              {activeTool === 'faq' && toolData?.faqItems && (
                <div className="space-y-2">
                  {toolData.faqItems.map((item: FaqItem, i: number) => {
                    const isExpanded = expandedFaqIndex === i;
                    return (
                      <div
                        key={i}
                        className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden"
                      >
                        <button
                          onClick={() => setExpandedFaqIndex(isExpanded ? null : i)}
                          className="w-full p-3 text-left font-bold text-slate-900 dark:text-white flex items-center justify-between gap-2 hover:bg-slate-50 dark:hover:bg-slate-850"
                        >
                          <span>{item.question}</span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                          )}
                        </button>
                        {isExpanded && (
                          <div className="p-3 pt-0 text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800/60 mt-1">
                            {item.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 7. TIMELINE TOOL */}
              {activeTool === 'timeline' && toolData?.timelineEvents && (
                <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-indigo-200 dark:before:bg-indigo-900/60 pl-6">
                  {toolData.timelineEvents.map((ev: TimelineEvent, i: number) => (
                    <div key={i} className="relative">
                      <span className="absolute -left-6 top-1.5 w-2.5 h-2.5 rounded-full bg-indigo-600 ring-4 ring-white dark:ring-slate-950" />
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                          {ev.yearOrPhase}
                        </span>
                        <h4 className="font-bold text-slate-900 dark:text-white mt-0.5">
                          {ev.title}
                        </h4>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">{ev.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 8. KEY CONCEPTS TOOL */}
              {activeTool === 'key-concepts' && toolData?.concepts && (
                <div className="grid grid-cols-1 gap-2.5">
                  {toolData.concepts.map((c: KeyConceptItem, i: number) => (
                    <div
                      key={i}
                      className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800"
                    >
                      <span className="text-[10px] font-bold uppercase text-teal-600 dark:text-teal-400">
                        Concept #{i + 1}
                      </span>
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs mt-0.5">
                        {c.name}
                      </h4>
                      <p className="text-slate-600 dark:text-slate-300 mt-1">{c.definition}</p>
                      {c.keyFormulaOrMechanism && (
                        <p className="mt-2 text-[11px] font-mono bg-slate-50 dark:bg-slate-800 p-2 rounded text-indigo-600 dark:text-indigo-300">
                          {c.keyFormulaOrMechanism}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* 9. NOTES / SCRATCHPAD TOOL */}
              {activeTool === 'notes' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase text-slate-400">
                      Personal Markdown Scratchpad
                    </span>
                    <button
                      onClick={() => {
                        onSaveItem({
                          notebookId: activeSources[0]?.notebookId || '',
                          toolType: 'notes',
                          title: `Notes: ${notebookTitle}`,
                          data: { text: scratchpadNotes },
                          tags: ['User Note'],
                        });
                      }}
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Save className="w-3 h-3" />
                      <span>Save Note</span>
                    </button>
                  </div>

                  <textarea
                    rows={12}
                    value={scratchpadNotes}
                    onChange={(e) => setScratchpadNotes(e.target.value)}
                    className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
                  />
                </div>
              )}

              {/* 10. SAVED RESPONSES TOOL */}
              {activeTool === 'saved-responses' && (
                <div className="space-y-3">
                  <span className="text-[11px] font-bold uppercase text-slate-400">
                    Saved Outputs ({savedItems.length})
                  </span>

                  {savedItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400">
                          {item.toolType}
                        </span>
                        <button
                          onClick={() => onDeleteItem(item.id)}
                          className="text-slate-400 hover:text-rose-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                        {item.title}
                      </h4>
                      <p className="text-[10px] text-slate-400">
                        Saved on {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}

                  {savedItems.length === 0 && (
                    <p className="text-xs text-slate-500 text-center py-8">
                      No saved artifacts yet. Use the bookmark or save button on any tool output to store it here.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </aside>
  );
};

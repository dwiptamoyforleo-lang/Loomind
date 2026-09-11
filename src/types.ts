export type ThemeMode = 'light' | 'dark';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
}

export type SourceType = 'pdf' | 'text' | 'url' | 'markdown' | 'doc' | 'notes';

export interface ResearchSource {
  id: string;
  notebookId: string;
  title: string;
  type: SourceType;
  content: string;
  originalUrl?: string;
  fileSize?: string;
  wordCount: number;
  charCount: number;
  uploadedAt: number;
  isSelected: boolean; // whether active in AI synthesis context
  citationIndex: number; // 1, 2, 3...
  status: 'indexed' | 'processing' | 'error';
  errorMessage?: string;
  author?: string;
  publishedYear?: string;
}

export interface CitationRef {
  index: number;
  sourceId: string;
  sourceTitle: string;
  snippet?: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  citations?: CitationRef[];
  isSaved?: boolean;
  modelUsed?: string;
  isFallback?: boolean;
}

export interface Conversation {
  id: string;
  notebookId: string;
  title: string;
  createdAt: number;
  updatedAt: number;
}

export type StudioToolType =
  | 'summary'
  | 'study-guide'
  | 'quiz'
  | 'flashcards'
  | 'faq'
  | 'timeline'
  | 'key-concepts'
  | 'notes'
  | 'audio-overview'
  | 'saved-responses';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  citation?: string;
  userSelected?: number;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  category?: string;
  source?: string;
  mastered?: boolean;
}

export interface TimelineEvent {
  yearOrPhase: string;
  title: string;
  description: string;
  category?: string;
}

export interface KeyConceptItem {
  name: string;
  definition: string;
  keyFormulaOrMechanism?: string;
  importance?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
  category?: string;
}

export interface AudioOverviewDialogue {
  speaker: 'Alex' | 'Jordan';
  text: string;
}

export interface AudioOverviewData {
  episodeTitle: string;
  estimatedDurationMinutes: number;
  summary: string;
  dialogue: AudioOverviewDialogue[];
}

export interface SummaryData {
  executiveSummary: string;
  keyHighlights: string[];
  methodologyAndFindings: string;
  limitationsAndNextSteps: string;
  sourceContributions: Array<{ sourceTitle: string; keyTakeaway: string }>;
}

export interface StudyGuideData {
  title: string;
  learningObjectives: string[];
  coreTheorems: Array<{ concept: string; summary: string; citation?: string }>;
  reviewQuestions: Array<{ question: string; idealAnswer: string }>;
  glossary: Array<{ term: string; definition: string }>;
}

export interface StudioSavedItem {
  id: string;
  notebookId: string;
  toolType: StudioToolType;
  title: string;
  data: any;
  createdAt: number;
  tags?: string[];
}

export interface Notebook {
  id: string;
  userId: string;
  title: string;
  description: string;
  color: 'indigo' | 'emerald' | 'amber' | 'sky' | 'rose' | 'violet';
  tags: string[];
  isFavorite: boolean;
  isArchived: boolean;
  createdAt: number;
  updatedAt: number;
  sourcesCount?: number;
}

export type ActiveWorkspaceTab = 'sources' | 'chat' | 'studio';

export interface GlobalSearchResult {
  id: string;
  type: 'notebook' | 'source' | 'chat' | 'studio' | 'note';
  notebookId: string;
  notebookTitle: string;
  title: string;
  subtitle: string;
  snippet?: string;
}

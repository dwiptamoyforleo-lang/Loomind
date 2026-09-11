import React, { useState, useEffect } from 'react';
import {
  Search,
  X,
  Layers,
  FileText,
  MessageSquare,
  Bookmark,
  ArrowRight,
} from 'lucide-react';
import { Notebook, ResearchSource, ChatMessage, StudioSavedItem, GlobalSearchResult } from '../../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  notebooks: Notebook[];
  sources: ResearchSource[];
  messages: ChatMessage[];
  savedItems: StudioSavedItem[];
  onSelectNotebook: (id: string) => void;
  onPreviewSource: (source: ResearchSource) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  notebooks,
  sources,
  messages,
  savedItems,
  onSelectNotebook,
  onPreviewSource,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GlobalSearchResult[]>([]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const q = query.toLowerCase();
    const matches: GlobalSearchResult[] = [];

    // Search Notebooks
    notebooks.forEach((nb) => {
      if (nb.title.toLowerCase().includes(q) || nb.description.toLowerCase().includes(q)) {
        matches.push({
          id: nb.id,
          type: 'notebook',
          notebookId: nb.id,
          notebookTitle: nb.title,
          title: nb.title,
          subtitle: 'Research Notebook',
          snippet: nb.description,
        });
      }
    });

    // Search Sources
    sources.forEach((src) => {
      const parentNb = notebooks.find((n) => n.id === src.notebookId);
      if (src.title.toLowerCase().includes(q) || src.content.toLowerCase().includes(q)) {
        matches.push({
          id: src.id,
          type: 'source',
          notebookId: src.notebookId,
          notebookTitle: parentNb?.title || 'Unknown Project',
          title: src.title,
          subtitle: `Source [${src.citationIndex}] • ${src.type}`,
          snippet: src.content.slice(0, 140) + '...',
        });
      }
    });

    // Search Studio Artifacts
    savedItems.forEach((item) => {
      const parentNb = notebooks.find((n) => n.id === item.notebookId);
      if (item.title.toLowerCase().includes(q)) {
        matches.push({
          id: item.id,
          type: 'studio',
          notebookId: item.notebookId,
          notebookTitle: parentNb?.title || 'Project',
          title: item.title,
          subtitle: `Saved ${item.toolType}`,
        });
      }
    });

    setResults(matches.slice(0, 8));
  }, [query, notebooks, sources, messages, savedItems]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-20 p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Search Input Bar */}
        <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notebooks, papers, transcripts, and notes..."
            autoFocus
            className="w-full text-sm bg-transparent border-none text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Stream */}
        <div className="p-2 max-h-96 overflow-y-auto space-y-1 text-xs">
          {results.map((res) => (
            <button
              key={`${res.type}-${res.id}`}
              onClick={() => {
                if (res.type === 'source') {
                  const targetSource = sources.find((s) => s.id === res.id);
                  if (targetSource) onPreviewSource(targetSource);
                } else {
                  onSelectNotebook(res.notebookId);
                }
                onClose();
              }}
              className="w-full p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-start gap-3 text-left group cursor-pointer"
            >
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
                {res.type === 'notebook' ? (
                  <Layers className="w-4 h-4" />
                ) : res.type === 'source' ? (
                  <FileText className="w-4 h-4" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                    {res.title}
                  </span>
                  <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                    {res.notebookTitle}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {res.subtitle}
                </p>
                {res.snippet && (
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 line-clamp-1 italic">
                    {res.snippet}
                  </p>
                )}
              </div>
            </button>
          ))}

          {query.trim() && results.length === 0 && (
            <div className="py-8 text-center text-slate-400">
              <p>No results found for &ldquo;{query}&rdquo;</p>
            </div>
          )}

          {!query.trim() && (
            <div className="p-4 text-center text-slate-400 text-xs">
              Type keywords to search literature, notebooks, or citations.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

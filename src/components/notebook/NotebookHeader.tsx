import React, { useState } from 'react';
import {
  ArrowLeft,
  Share2,
  FileText,
  Sparkles,
  Search,
  Plus,
  Edit2,
  Check,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';
import { Notebook, ResearchSource } from '../../types';

interface NotebookHeaderProps {
  notebook: Notebook;
  sources: ResearchSource[];
  onBackToHome: () => void;
  onUpdateNotebook: (updated: Partial<Notebook>) => void;
  onOpenAddSource: () => void;
  onOpenExport: () => void;
  onOpenSearch: () => void;
  geminiConfigured?: boolean;
}

export const NotebookHeader: React.FC<NotebookHeaderProps> = ({
  notebook,
  sources,
  onBackToHome,
  onUpdateNotebook,
  onOpenAddSource,
  onOpenExport,
  onOpenSearch,
  geminiConfigured,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(notebook.title);

  const activeSourcesCount = sources.filter((s) => s.isSelected).length;

  const handleTitleSubmit = () => {
    if (tempTitle.trim() && tempTitle !== notebook.title) {
      onUpdateNotebook({ title: tempTitle.trim(), updatedAt: Date.now() });
    }
    setIsEditingTitle(false);
  };

  return (
    <header className="h-14 px-4 sm:px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 z-20">
      {/* Left: Breadcrumbs & Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onBackToHome}
          className="p-1.5 -ml-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Back to All Notebooks"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

        <div className="min-w-0">
          {isEditingTitle ? (
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleTitleSubmit();
                  if (e.key === 'Escape') {
                    setTempTitle(notebook.title);
                    setIsEditingTitle(false);
                  }
                }}
                autoFocus
                className="text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-2 py-0.5 rounded border border-indigo-500 focus:outline-none"
              />
              <button
                onClick={handleTitleSubmit}
                className="p-1 text-emerald-600 hover:text-emerald-700"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 group">
              <h1
                onClick={() => setIsEditingTitle(true)}
                className="text-sm font-bold text-slate-900 dark:text-white truncate cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                {notebook.title}
              </h1>
              <button
                onClick={() => setIsEditingTitle(true)}
                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-opacity"
                title="Edit notebook title"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <span>
              <strong className="text-slate-700 dark:text-slate-300 font-semibold">
                {activeSourcesCount}
              </strong>{' '}
              of {sources.length} sources active
            </span>
          </div>
        </div>
      </div>

      {/* Center: Intelligence Status Badge */}
      <div className="hidden lg:flex items-center gap-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-[11px] font-medium text-slate-600 dark:text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Grounded in Active Sources</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={onOpenSearch}
          className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Search in workspace"
        >
          <Search className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenExport}
          className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Export research notebook"
        >
          <Share2 className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenAddSource}
          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Add Source</span>
        </button>
      </div>
    </header>
  );
};

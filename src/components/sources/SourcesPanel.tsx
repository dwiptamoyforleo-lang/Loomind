import React, { useState } from 'react';
import {
  FileText,
  Upload,
  Plus,
  CheckSquare,
  Square,
  Search,
  MoreVertical,
  ExternalLink,
  Trash2,
  Edit2,
  BookOpen,
  Link2,
  FileCode,
  Eye,
  Layers,
  Sparkles,
} from 'lucide-react';
import { ResearchSource, SourceType } from '../../types';

interface SourcesPanelProps {
  sources: ResearchSource[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onOpenAddSource: () => void;
  onPreviewSource: (source: ResearchSource) => void;
  onDeleteSource: (id: string) => void;
  onRenameSource: (id: string, newTitle: string) => void;
}

export const SourcesPanel: React.FC<SourcesPanelProps> = ({
  sources,
  onToggleSelect,
  onToggleSelectAll,
  onOpenAddSource,
  onPreviewSource,
  onDeleteSource,
  onRenameSource,
}) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const activeCount = sources.filter((s) => s.isSelected).length;
  const allSelected = sources.length > 0 && activeCount === sources.length;

  const filteredSources = sources.filter((s) => {
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      s.content.toLowerCase().includes(q) ||
      (s.author && s.author.toLowerCase().includes(q))
    );
  });

  const getSourceIcon = (type: SourceType) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-4 h-4 text-rose-500" />;
      case 'url':
        return <Link2 className="w-4 h-4 text-sky-500" />;
      case 'markdown':
      case 'doc':
        return <FileCode className="w-4 h-4 text-indigo-500" />;
      default:
        return <FileText className="w-4 h-4 text-emerald-500" />;
    }
  };

  const handleStartRename = (src: ResearchSource) => {
    setEditingId(src.id);
    setEditTitle(src.title);
    setActiveMenuId(null);
  };

  const handleSaveRename = (id: string) => {
    if (editTitle.trim()) {
      onRenameSource(id, editTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <aside className="w-full md:w-72 lg:w-80 h-full flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shrink-0 select-none">
      {/* Panel Header */}
      <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Sources & Evidence
            </h2>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-mono">
              {sources.length}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {activeCount} active in AI synthesis
          </p>
        </div>

        <button
          onClick={onOpenAddSource}
          className="p-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          title="Add documents or links"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>
      </div>

      {/* Select All Toggle & Search */}
      <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800/60 space-y-2 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center justify-between text-xs">
          <button
            onClick={onToggleSelectAll}
            className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            {allSelected ? (
              <CheckSquare className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            ) : (
              <Square className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span className="text-[11px] font-medium">
              {allSelected ? 'Deselect all' : 'Select all'}
            </span>
          </button>

          <span className="text-[10px] text-slate-400">
            {sources.reduce((acc, s) => acc + s.wordCount, 0).toLocaleString()} words total
          </span>
        </div>

        {/* Quick Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Search within sources..."
            className="w-full pl-8 pr-2.5 py-1 text-xs bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Sources List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
        {filteredSources.map((src) => {
          const isEditing = editingId === src.id;

          return (
            <div
              key={src.id}
              className={`rounded-xl border transition-all p-3 relative flex flex-col justify-between ${
                src.isSelected
                  ? 'bg-white dark:bg-slate-800/90 border-indigo-200 dark:border-indigo-900/60 shadow-xs'
                  : 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-70'
              }`}
            >
              {/* Header row */}
              <div className="flex items-start gap-2">
                <button
                  onClick={() => onToggleSelect(src.id)}
                  className="mt-0.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 shrink-0 cursor-pointer"
                  title={src.isSelected ? 'Exclude from AI synthesis' : 'Include in AI synthesis'}
                >
                  {src.isSelected ? (
                    <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="p-0.5 rounded bg-slate-100 dark:bg-slate-800">
                      {getSourceIcon(src.type)}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      [{src.citationIndex}] {src.type}
                    </span>
                    {src.status === 'processing' && (
                      <span className="text-[9px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-1 rounded animate-pulse">
                        Indexing...
                      </span>
                    )}
                  </div>

                  {isEditing ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={() => handleSaveRename(src.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveRename(src.id);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      autoFocus
                      className="w-full text-xs font-semibold bg-white dark:bg-slate-800 px-1.5 py-0.5 border border-indigo-500 rounded text-slate-900 dark:text-white"
                    />
                  ) : (
                    <h3
                      onClick={() => onPreviewSource(src)}
                      className="text-xs font-semibold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer leading-snug line-clamp-2"
                      title={src.title}
                    >
                      {src.title}
                    </h3>
                  )}

                  {src.author && (
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      {src.author} {src.publishedYear && `(${src.publishedYear})`}
                    </p>
                  )}
                </div>

                {/* More Menu */}
                <div className="relative shrink-0">
                  <button
                    onClick={() => setActiveMenuId(activeMenuId === src.id ? null : src.id)}
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>

                  {activeMenuId === src.id && (
                    <div
                      className="absolute right-0 top-5 w-32 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-30 text-xs font-medium"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => {
                          onPreviewSource(src);
                          setActiveMenuId(null);
                        }}
                        className="w-full text-left px-3 py-1 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview</span>
                      </button>
                      <button
                        onClick={() => handleStartRename(src)}
                        className="w-full text-left px-3 py-1 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1.5"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Rename</span>
                      </button>
                      <button
                        onClick={() => {
                          onDeleteSource(src.id);
                          setActiveMenuId(null);
                        }}
                        className="w-full text-left px-3 py-1 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Source Stats row */}
              <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                <span>{src.fileSize || `${src.wordCount} words`}</span>
                <button
                  onClick={() => onPreviewSource(src)}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>Read</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>
          );
        })}

        {/* Empty sources state */}
        {filteredSources.length === 0 && (
          <div className="p-6 text-center text-slate-500 dark:text-slate-400">
            <Layers className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              No sources attached yet
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Add PDFs, papers, web URLs, or text notes to ground the AI in your research.
            </p>
            <button
              onClick={onOpenAddSource}
              className="mt-3 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Import First Source</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

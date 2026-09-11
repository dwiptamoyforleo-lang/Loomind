import React, { useState } from 'react';
import {
  Plus,
  Search,
  Star,
  Clock,
  Sparkles,
  BookOpen,
  FileText,
  Trash2,
  MoreVertical,
  Layers,
  ArrowRight,
  Headphones,
  CheckCircle2,
  FolderOpen,
  Bookmark,
  Compass,
} from 'lucide-react';
import { Notebook, ResearchSource, UserProfile } from '../../types';

interface HomeScreenProps {
  user: UserProfile;
  notebooks: Notebook[];
  sources: ResearchSource[];
  onSelectNotebook: (id: string) => void;
  onOpenNewNotebook: () => void;
  onOpenAddSource: (notebookId?: string) => void;
  onToggleFavorite: (id: string) => void;
  onArchiveNotebook: (id: string) => void;
  onDeletePermanently: (id: string) => void;
  filter: 'all' | 'recent' | 'starred' | 'archive';
  onSetFilter: (filter: 'all' | 'recent' | 'starred' | 'archive') => void;
  onOpenSearch: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  user,
  notebooks,
  sources,
  onSelectNotebook,
  onOpenNewNotebook,
  onOpenAddSource,
  onToggleFavorite,
  onArchiveNotebook,
  onDeletePermanently,
  filter,
  onSetFilter,
  onOpenSearch,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Filter notebooks
  const displayedNotebooks = notebooks.filter((nb) => {
    if (filter === 'archive') {
      if (!nb.isArchived) return false;
    } else {
      if (nb.isArchived) return false;
      if (filter === 'starred' && !nb.isFavorite) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = nb.title.toLowerCase().includes(q);
      const matchDesc = nb.description.toLowerCase().includes(q);
      const matchTag = nb.tags.some((t) => t.toLowerCase().includes(q));
      return matchTitle || matchDesc || matchTag;
    }
    return true;
  });

  // Recent sources
  const recentSources = [...sources]
    .sort((a, b) => b.uploadedAt - a.uploadedAt)
    .slice(0, 4);

  // Format relative time helper
  const formatTimeAgo = (time: number) => {
    const diff = Date.now() - time;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  // Color mapping
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'emerald':
        return {
          banner: 'bg-emerald-600 dark:bg-emerald-700',
          badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
          dot: 'bg-emerald-500',
        };
      case 'amber':
        return {
          banner: 'bg-amber-600 dark:bg-amber-700',
          badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
          dot: 'bg-amber-500',
        };
      case 'sky':
        return {
          banner: 'bg-sky-600 dark:bg-sky-700',
          badge: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800',
          dot: 'bg-sky-500',
        };
      case 'rose':
        return {
          banner: 'bg-rose-600 dark:bg-rose-700',
          badge: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800',
          dot: 'bg-rose-500',
        };
      case 'violet':
        return {
          banner: 'bg-violet-600 dark:bg-violet-700',
          badge: 'bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 border-violet-200 dark:border-violet-800',
          dot: 'bg-violet-500',
        };
      default:
        return {
          banner: 'bg-indigo-600 dark:bg-indigo-700',
          badge: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
          dot: 'bg-indigo-500',
        };
    }
  };

  const activeNotebooksCount = notebooks.filter((n) => !n.isArchived).length;
  const mostRecentNotebook = displayedNotebooks[0];

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Welcome Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Research Studio
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Welcome back, {user.name}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              Grounded AI research workspace. Upload your literature, synthesize multi-source evidence, and generate study guides and audio overviews.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenNewNotebook}
              id="dashboard-create-notebook-btn"
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Notebook</span>
            </button>
          </div>
        </div>

        {/* Continue Research Hero Card (if notebook exists) */}
        {mostRecentNotebook && filter !== 'archive' && (
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-indigo-900/40 relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-indigo-500/5 blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-indigo-300 bg-indigo-900/60 px-2 py-0.5 rounded-full border border-indigo-700/50">
                    <Sparkles className="w-3 h-3" />
                    Jump Back In
                  </span>
                  <span className="text-xs text-slate-400">
                    Last touched {formatTimeAgo(mostRecentNotebook.updatedAt)}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  {mostRecentNotebook.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed">
                  {mostRecentNotebook.description}
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {mostRecentNotebook.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700"
                    >
                      #{tag}
                    </span>
                  ))}
                  <span className="text-xs text-indigo-300 font-medium ml-2">
                    {sources.filter((s) => s.notebookId === mostRecentNotebook.id).length} sources attached
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => onSelectNotebook(mostRecentNotebook.id)}
                  className="px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-900 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <span>Open Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 dark:bg-slate-900 rounded-xl border border-slate-300/60 dark:border-slate-800">
            <button
              onClick={() => onSetFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                filter === 'all'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Projects ({activeNotebooksCount})
            </button>
            <button
              onClick={() => onSetFilter('starred')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                filter === 'starred'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Starred
            </button>
            <button
              onClick={() => onSetFilter('archive')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                filter === 'archive'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Archive
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter notebooks..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Notebook Cards Grid */}
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedNotebooks.map((nb) => {
              const nbSources = sources.filter((s) => s.notebookId === nb.id);
              const colors = getColorClasses(nb.color);

              return (
                <div
                  key={nb.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col overflow-hidden group hover:border-indigo-300 dark:hover:border-indigo-800"
                >
                  {/* Top accent line */}
                  <div className={`h-1.5 w-full ${colors.banner}`} />

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
                          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            {nb.tags?.[0] || 'Research'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleFavorite(nb.id);
                            }}
                            className="p-1 text-slate-400 hover:text-amber-500 transition-colors"
                            title={nb.isFavorite ? 'Remove star' : 'Star notebook'}
                          >
                            <Star
                              className={`w-4 h-4 ${
                                nb.isFavorite
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-400'
                              }`}
                            />
                          </button>

                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(activeMenuId === nb.id ? null : nb.id);
                              }}
                              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {activeMenuId === nb.id && (
                              <div
                                className="absolute right-0 top-6 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-20 text-xs font-medium"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={() => {
                                    onArchiveNotebook(nb.id);
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full text-left px-3 py-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                                >
                                  <Bookmark className="w-3.5 h-3.5" />
                                  <span>{nb.isArchived ? 'Restore' : 'Archive'}</span>
                                </button>
                                {nb.isArchived && (
                                  <button
                                    onClick={() => {
                                      onDeletePermanently(nb.id);
                                      setActiveMenuId(null);
                                    }}
                                    className="w-full text-left px-3 py-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Delete Forever</span>
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <h3
                        onClick={() => onSelectNotebook(nb.id)}
                        className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors cursor-pointer leading-snug line-clamp-2"
                      >
                        {nb.title}
                      </h3>

                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                        {nb.description}
                      </p>
                    </div>

                    {/* Metadata Footer */}
                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1" title="Attached research sources">
                          <FileText className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {nbSources.length}
                          </span>{' '}
                          sources
                        </span>
                        <span className="flex items-center gap-1 text-[11px]">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{formatTimeAgo(nb.updatedAt)}</span>
                        </span>
                      </div>

                      <button
                        onClick={() => onSelectNotebook(nb.id)}
                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Open</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {displayedNotebooks.length === 0 && (
            <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {filter === 'archive'
                  ? 'Archive is empty'
                  : filter === 'starred'
                  ? 'No starred notebooks'
                  : 'No notebooks found'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                {filter === 'archive'
                  ? 'Projects you archive will appear here for restoration or deletion.'
                  : 'Get started by creating a research project and importing your documents.'}
              </p>
              {filter !== 'archive' && (
                <button
                  onClick={onOpenNewNotebook}
                  className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create First Notebook</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Recently Uploaded Sources Section */}
        {recentSources.length > 0 && filter !== 'archive' && (
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Recently Uploaded Literature & Sources
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Quick access to documents indexed across your active research projects.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {recentSources.map((src) => {
                const parentNb = notebooks.find((n) => n.id === src.notebookId);
                return (
                  <div
                    key={src.id}
                    onClick={() => {
                      if (parentNb) onSelectNotebook(parentNb.id);
                    }}
                    className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-700 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {src.type}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {src.fileSize || `${src.wordCount} words`}
                      </span>
                    </div>
                    <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 line-clamp-1">
                      {src.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
                      In {parentNb?.title || 'Notebook'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import React from 'react';
import {
  BookOpen,
  Plus,
  Compass,
  Star,
  Archive,
  Search,
  Settings,
  Sparkles,
  Moon,
  Sun,
  LogOut,
  FolderLock,
  ChevronRight,
  Layers,
} from 'lucide-react';
import { Notebook, UserProfile, ThemeMode } from '../../types';

interface SidebarProps {
  user: UserProfile;
  notebooks: Notebook[];
  activeNotebookId: string | null;
  onSelectNotebook: (id: string | null) => void;
  onOpenNewNotebook: () => void;
  onOpenSearch: () => void;
  onOpenProfile: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  currentFilter: 'all' | 'recent' | 'starred' | 'archive';
  onSetFilter: (filter: 'all' | 'recent' | 'starred' | 'archive') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  notebooks,
  activeNotebookId,
  onSelectNotebook,
  onOpenNewNotebook,
  onOpenSearch,
  onOpenProfile,
  theme,
  onToggleTheme,
  currentFilter,
  onSetFilter,
}) => {
  const activeNotebooks = notebooks.filter((n) => !n.isArchived);
  const starredNotebooks = activeNotebooks.filter((n) => n.isFavorite);
  const archivedNotebooks = notebooks.filter((n) => n.isArchived);

  return (
    <aside
      id="loomind-sidebar"
      className="hidden md:flex flex-col w-64 lg:w-72 h-screen bg-slate-900 text-slate-200 border-r border-slate-800 shrink-0 select-none"
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div
          onClick={() => onSelectNotebook(null)}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30 group-hover:bg-indigo-500 transition-colors">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight text-white">Loomind</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Noesis
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Research & Study Workspace</p>
          </div>
        </div>

        <button
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to Light mode' : 'Switch to Dark mode'}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* Action Button & Search */}
      <div className="p-3 space-y-2">
        <button
          onClick={onOpenNewNotebook}
          id="sidebar-new-notebook-btn"
          className="w-full py-2.5 px-3.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm shadow-indigo-900/40 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Research Notebook</span>
        </button>

        <button
          onClick={onOpenSearch}
          className="w-full py-2 px-3 bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg text-xs font-medium flex items-center justify-between border border-slate-700/60 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5" />
            <span>Search workspace...</span>
          </div>
          <kbd className="text-[10px] bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700 text-slate-400 font-mono">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Primary Navigation Links */}
      <div className="px-3 py-1 space-y-0.5">
        <button
          onClick={() => {
            onSetFilter('all');
            onSelectNotebook(null);
          }}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            activeNotebookId === null && currentFilter === 'all'
              ? 'bg-slate-800 text-white font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Compass className="w-4 h-4 text-indigo-400" />
            <span>Overview Dashboard</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">{activeNotebooks.length}</span>
        </button>

        <button
          onClick={() => {
            onSetFilter('starred');
            onSelectNotebook(null);
          }}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            activeNotebookId === null && currentFilter === 'starred'
              ? 'bg-slate-800 text-white font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Star className="w-4 h-4 text-amber-400" />
            <span>Starred Research</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">{starredNotebooks.length}</span>
        </button>

        <button
          onClick={() => {
            onSetFilter('archive');
            onSelectNotebook(null);
          }}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            activeNotebookId === null && currentFilter === 'archive'
              ? 'bg-slate-800 text-white font-semibold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Archive className="w-4 h-4 text-slate-400" />
            <span>Archive / Trash</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">{archivedNotebooks.length}</span>
        </button>
      </div>

      {/* Notebooks List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 mt-2">
        <div className="flex items-center justify-between px-2 mb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Active Notebooks
          </span>
          <span className="text-[10px] text-slate-500">{activeNotebooks.length}</span>
        </div>

        <div className="space-y-1">
          {activeNotebooks.map((nb) => {
            const isSelected = activeNotebookId === nb.id;
            const colorDot =
              nb.color === 'emerald'
                ? 'bg-emerald-400'
                : nb.color === 'amber'
                ? 'bg-amber-400'
                : nb.color === 'sky'
                ? 'bg-sky-400'
                : nb.color === 'rose'
                ? 'bg-rose-400'
                : nb.color === 'violet'
                ? 'bg-violet-400'
                : 'bg-indigo-400';

            return (
              <button
                key={nb.id}
                onClick={() => onSelectNotebook(nb.id)}
                className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-start gap-2.5 group cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800 text-white shadow-sm border border-slate-700/80'
                    : 'text-slate-300 hover:bg-slate-800/40 hover:text-white'
                }`}
              >
                <div className="pt-1">
                  <span className={`block w-2 h-2 rounded-full ${colorDot} shrink-0`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium truncate block leading-snug">{nb.title}</span>
                    {nb.isFavorite && (
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0 ml-1" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {nb.tags?.[0] || 'Research project'}
                  </p>
                </div>
              </button>
            );
          })}

          {activeNotebooks.length === 0 && (
            <div className="text-center py-6 px-2 text-slate-500 text-xs">
              <Layers className="w-6 h-6 mx-auto mb-1.5 opacity-40" />
              <p>No notebooks created yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* User Scoped Isolation Indicator */}
      <div className="px-4 py-2 border-t border-slate-800/60 bg-slate-950/40 text-[11px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <FolderLock className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[10px] text-slate-400">Encrypted User Workspace</span>
        </div>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Active Isolated Session" />
      </div>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
        <div
          onClick={onOpenProfile}
          className="flex items-center gap-2.5 cursor-pointer hover:opacity-85 transition-opacity min-w-0"
        >
          <img
            src={user.avatar}
            alt={user.name}
            className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0"
          />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user.name}</p>
            <p className="text-[10px] text-slate-400 truncate">{user.role}</p>
          </div>
        </div>

        <button
          onClick={onOpenProfile}
          title="Switch User / Account Profile"
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};

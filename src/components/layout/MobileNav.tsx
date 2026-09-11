import React, { useState } from 'react';
import {
  Menu,
  X,
  Plus,
  Compass,
  Star,
  Search,
  Sparkles,
  FileText,
  MessageSquare,
  Wrench,
  Moon,
  Sun,
  Layers,
} from 'lucide-react';
import { Notebook, UserProfile, ThemeMode, ActiveWorkspaceTab } from '../../types';

interface MobileNavProps {
  user: UserProfile;
  notebooks: Notebook[];
  activeNotebook: Notebook | null;
  onSelectNotebook: (id: string | null) => void;
  onOpenNewNotebook: () => void;
  onOpenSearch: () => void;
  onOpenProfile: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  activeTab: ActiveWorkspaceTab;
  onSelectTab: (tab: ActiveWorkspaceTab) => void;
  sourcesCount: number;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  user,
  notebooks,
  activeNotebook,
  onSelectNotebook,
  onOpenNewNotebook,
  onOpenSearch,
  onOpenProfile,
  theme,
  onToggleTheme,
  activeTab,
  onSelectTab,
  sourcesCount,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      {/* Mobile Top Bar */}
      <header className="md:hidden flex items-center justify-between px-3.5 py-2.5 bg-slate-900 text-slate-100 border-b border-slate-800 shrink-0 z-30 sticky top-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div
            onClick={() => onSelectNotebook(null)}
            className="flex items-center gap-1.5 cursor-pointer"
          >
            <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center text-white">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-xs tracking-tight">Loomind</span>
          </div>
        </div>

        {activeNotebook && (
          <div className="flex-1 mx-2 text-center min-w-0">
            <p className="text-xs font-semibold truncate text-slate-200">
              {activeNotebook.title}
            </p>
          </div>
        )}

        <div className="flex items-center gap-1">
          <button
            onClick={onOpenSearch}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={onToggleTheme}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={onOpenProfile}
            className="w-7 h-7 rounded-full overflow-hidden border border-slate-700 ml-1"
          >
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          </button>
        </div>
      </header>

      {/* Mobile Slide-Over Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />

          <div className="relative flex flex-col w-4/5 max-w-xs bg-slate-900 text-slate-100 h-full border-r border-slate-800 shadow-2xl p-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm">Loomind Noesis</span>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-3 space-y-2">
              <button
                onClick={() => {
                  onOpenNewNotebook();
                  setIsDrawerOpen(false);
                }}
                className="w-full py-2.5 px-3 bg-indigo-600 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>New Research Notebook</span>
              </button>

              <button
                onClick={() => {
                  onSelectNotebook(null);
                  setIsDrawerOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 rounded-lg"
              >
                <Compass className="w-4 h-4 text-indigo-400" />
                <span>Overview Dashboard</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pt-2 border-t border-slate-800">
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2">
                Your Notebooks
              </p>
              <div className="space-y-1">
                {notebooks
                  .filter((n) => !n.isArchived)
                  .map((nb) => (
                    <button
                      key={nb.id}
                      onClick={() => {
                        onSelectNotebook(nb.id);
                        setIsDrawerOpen(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                        activeNotebook?.id === nb.id
                          ? 'bg-slate-800 text-white font-semibold'
                          : 'text-slate-300 hover:bg-slate-800/60'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span className="truncate">{nb.title}</span>
                    </button>
                  ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border border-slate-700"
                />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{user.role}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Workspace Tabs (When Notebook is Open) */}
      {activeNotebook && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-3 py-1.5 flex items-center justify-around shadow-lg">
          <button
            onClick={() => onSelectTab('sources')}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-[10px] font-medium transition-colors ${
              activeTab === 'sources'
                ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <div className="relative">
              <FileText className="w-4 h-4" />
              {sourcesCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-indigo-600 text-white rounded-full text-[9px] w-3.5 h-3.5 flex items-center justify-center font-bold">
                  {sourcesCount}
                </span>
              )}
            </div>
            <span>Sources</span>
          </button>

          <button
            onClick={() => onSelectTab('chat')}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-[10px] font-medium transition-colors ${
              activeTab === 'chat'
                ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>AI Chat</span>
          </button>

          <button
            onClick={() => onSelectTab('studio')}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-[10px] font-medium transition-colors ${
              activeTab === 'studio'
                ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Studio Tools</span>
          </button>
        </div>
      )}
    </>
  );
};

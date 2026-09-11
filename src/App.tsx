import React, { useState, useEffect, useCallback } from 'react';
import {
  Notebook,
  ResearchSource,
  ChatMessage,
  StudioSavedItem,
  UserProfile,
  ThemeMode,
  ActiveWorkspaceTab,
} from './types';
import { DEFAULT_USERS } from './data/seedData';
import {
  getSavedCurrentUserId,
  saveCurrentUserId,
  loadUserWorkspace,
  saveUserWorkspace,
  clearUserData,
} from './utils/storage';
import { sendChatMessage, checkServerConfig } from './utils/api';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { HomeScreen } from './components/dashboard/HomeScreen';
import { NotebookHeader } from './components/notebook/NotebookHeader';
import { SourcesPanel } from './components/sources/SourcesPanel';
import { ChatWorkspace } from './components/chat/ChatWorkspace';
import { StudioPanel } from './components/studio/StudioPanel';
import { AddSourceModal } from './components/sources/AddSourceModal';
import { SourceReaderModal } from './components/sources/SourceReaderModal';
import { GlobalSearchModal } from './components/search/GlobalSearchModal';
import { UserProfileModal } from './components/modals/UserProfileModal';
import { NewNotebookModal } from './components/modals/NewNotebookModal';
import { ShareExportModal } from './components/modals/ShareExportModal';

export const App: React.FC = () => {
  // 1. User & Authentication Isolation
  const [currentUserId, setCurrentUserId] = useState<string>(getSavedCurrentUserId);
  const currentUser = DEFAULT_USERS.find((u) => u.id === currentUserId) || DEFAULT_USERS[0];

  // User-scoped persistent state
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [sources, setSources] = useState<ResearchSource[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [savedItems, setSavedItems] = useState<StudioSavedItem[]>([]);

  // 2. Active Selection & Navigation
  const [activeNotebookId, setActiveNotebookId] = useState<string | null>(null);
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<ActiveWorkspaceTab>('chat');
  const [filterMode, setFilterMode] = useState<'all' | 'recent' | 'starred' | 'archive'>('all');

  // 3. Theme Mode
  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('noesis_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'dark';
    }
  });

  // Apply dark mode class to root HTML
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('noesis_theme', theme);
    } catch (e) {
      console.warn('Failed to save theme setting:', e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // 4. Modals State
  const [isAddSourceOpen, setIsAddSourceOpen] = useState(false);
  const [previewingSource, setPreviewingSource] = useState<ResearchSource | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNewNotebookOpen, setIsNewNotebookOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // 5. Chat Loading & AI Config
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [geminiConfigured, setGeminiConfigured] = useState(false);

  // Load user data on startup or when switching accounts
  useEffect(() => {
    saveCurrentUserId(currentUserId);
    const loaded = loadUserWorkspace(currentUserId);
    setNotebooks(loaded.notebooks);
    setSources(loaded.sources);
    setMessages(loaded.messages);
    setSavedItems(loaded.savedItems);
    setActiveNotebookId(loaded.notebooks[0]?.id || null);
  }, [currentUserId]);

  // Persist user data whenever workspace changes
  useEffect(() => {
    if (notebooks.length > 0 || sources.length > 0) {
      saveUserWorkspace(currentUserId, {
        notebooks,
        sources,
        messages,
        savedItems,
      });
    }
  }, [notebooks, sources, messages, savedItems, currentUserId]);

  // Check server config
  useEffect(() => {
    checkServerConfig().then((cfg) => {
      setGeminiConfigured(cfg.geminiConfigured);
    });
  }, []);

  // Keyboard shortcut for Search (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Account switching with strict data isolation
  const handleSwitchUser = (newUserId: string) => {
    setCurrentUserId(newUserId);
  };

  const handleClearUserData = () => {
    clearUserData(currentUserId);
    const fresh = loadUserWorkspace(currentUserId);
    setNotebooks(fresh.notebooks);
    setSources(fresh.sources);
    setMessages(fresh.messages);
    setSavedItems(fresh.savedItems);
    setActiveNotebookId(fresh.notebooks[0]?.id || null);
  };

  // Notebook Actions
  const activeNotebook = notebooks.find((n) => n.id === activeNotebookId) || null;
  const notebookSources = sources.filter((s) => s.notebookId === activeNotebookId);
  const notebookMessages = messages.filter(
    (m) =>
      m.conversationId === `conv_${activeNotebookId}` ||
      (m.conversationId.startsWith('conv_') && activeNotebookId?.includes('clara'))
  );
  const notebookSavedItems = savedItems.filter((item) => item.notebookId === activeNotebookId);

  const handleCreateNotebook = (newNb: Omit<Notebook, 'id' | 'createdAt' | 'updatedAt'>) => {
    const created: Notebook = {
      ...newNb,
      id: `nb_${Date.now()}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setNotebooks((prev) => [created, ...prev]);
    setActiveNotebookId(created.id);
  };

  const handleUpdateNotebook = (updates: Partial<Notebook>) => {
    if (!activeNotebookId) return;
    setNotebooks((prev) =>
      prev.map((nb) => (nb.id === activeNotebookId ? { ...nb, ...updates } : nb))
    );
  };

  const handleToggleFavorite = (id: string) => {
    setNotebooks((prev) =>
      prev.map((nb) => (nb.id === id ? { ...nb, isFavorite: !nb.isFavorite } : nb))
    );
  };

  const handleArchiveNotebook = (id: string) => {
    setNotebooks((prev) =>
      prev.map((nb) => (nb.id === id ? { ...nb, isArchived: !nb.isArchived } : nb))
    );
  };

  const handleDeletePermanently = (id: string) => {
    setNotebooks((prev) => prev.filter((nb) => nb.id !== id));
    setSources((prev) => prev.filter((s) => s.notebookId !== id));
    setSavedItems((prev) => prev.filter((item) => item.notebookId !== id));
    if (activeNotebookId === id) setActiveNotebookId(null);
  };

  // Source Actions
  const handleAddSource = (src: Omit<ResearchSource, 'id' | 'citationIndex'>) => {
    const existingCount = sources.filter((s) => s.notebookId === src.notebookId).length;
    const newSource: ResearchSource = {
      ...src,
      id: `src_${Date.now()}`,
      citationIndex: existingCount + 1,
    };
    setSources((prev) => [...prev, newSource]);
    // update notebook modified timestamp
    setNotebooks((prev) =>
      prev.map((nb) => (nb.id === src.notebookId ? { ...nb, updatedAt: Date.now() } : nb))
    );
  };

  const handleToggleSourceSelect = (id: string) => {
    setSources((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isSelected: !s.isSelected } : s))
    );
  };

  const handleToggleSelectAll = () => {
    if (!activeNotebookId) return;
    const currentActiveSources = sources.filter((s) => s.notebookId === activeNotebookId);
    const allSelected = currentActiveSources.every((s) => s.isSelected);
    setSources((prev) =>
      prev.map((s) =>
        s.notebookId === activeNotebookId ? { ...s, isSelected: !allSelected } : s
      )
    );
  };

  const handleDeleteSource = (id: string) => {
    setSources((prev) => prev.filter((s) => s.id !== id));
  };

  const handleRenameSource = (id: string, newTitle: string) => {
    setSources((prev) => prev.map((s) => (s.id === id ? { ...s, title: newTitle } : s)));
  };

  // Chat Actions
  const handleSendMessage = async (text: string) => {
    if (!activeNotebook) return;

    const userMsg: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      conversationId: `conv_${activeNotebook.id}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      const history = notebookMessages.map((m) => ({ role: m.role, content: m.content }));
      const response = await sendChatMessage(
        text,
        notebookSources,
        activeNotebook.title,
        history
      );

      const assistantMsg: ChatMessage = {
        id: `msg_a_${Date.now()}`,
        conversationId: `conv_${activeNotebook.id}`,
        role: 'assistant',
        content: response.text,
        timestamp: Date.now(),
        citations: response.sourcesUsed.map((s) => ({
          index: s.index,
          sourceId: s.id,
          sourceTitle: s.title,
        })),
        isFallback: response.isFallback,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e) {
      console.error('Failed to get chat response:', e);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleRegenerateMessage = (msgId: string) => {
    const idx = messages.findIndex((m) => m.id === msgId);
    if (idx > 0) {
      const prevUserMsg = messages[idx - 1];
      if (prevUserMsg && prevUserMsg.role === 'user') {
        handleSendMessage(prevUserMsg.content);
      }
    }
  };

  const handleSaveMessageToStudio = (msg: ChatMessage) => {
    if (!activeNotebook) return;
    const newItem: StudioSavedItem = {
      id: `saved_${Date.now()}`,
      notebookId: activeNotebook.id,
      toolType: 'saved-responses',
      title: `Response: ${msg.content.slice(0, 45)}...`,
      data: { content: msg.content, citations: msg.citations },
      createdAt: Date.now(),
      tags: ['Saved Chat'],
    };
    setSavedItems((prev) => [newItem, ...prev]);
  };

  // Studio Saved Items
  const handleSaveStudioItem = (item: Omit<StudioSavedItem, 'id' | 'createdAt'>) => {
    const saved: StudioSavedItem = {
      ...item,
      id: `saved_${Date.now()}`,
      createdAt: Date.now(),
    };
    setSavedItems((prev) => [saved, ...prev]);
  };

  const handleDeleteStudioItem = (id: string) => {
    setSavedItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 antialiased selection:bg-indigo-500/20 selection:text-indigo-600">
      {/* 1. Desktop Sidebar */}
      <Sidebar
        user={currentUser}
        notebooks={notebooks}
        activeNotebookId={activeNotebookId}
        onSelectNotebook={(id) => setActiveNotebookId(id)}
        onOpenNewNotebook={() => setIsNewNotebookOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
        currentFilter={filterMode}
        onSetFilter={(f) => setFilterMode(f)}
      />

      {/* 2. Main Work Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        {/* Mobile Header and Drawer */}
        <MobileNav
          user={currentUser}
          notebooks={notebooks}
          activeNotebook={activeNotebook}
          onSelectNotebook={(id) => setActiveNotebookId(id)}
          onOpenNewNotebook={() => setIsNewNotebookOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
          theme={theme}
          onToggleTheme={toggleTheme}
          activeTab={activeWorkspaceTab}
          onSelectTab={(tab) => setActiveWorkspaceTab(tab)}
          sourcesCount={notebookSources.length}
        />

        {/* Dynamic View: Home Dashboard OR Active Notebook Workspace */}
        {!activeNotebook ? (
          <HomeScreen
            user={currentUser}
            notebooks={notebooks}
            sources={sources}
            onSelectNotebook={(id) => setActiveNotebookId(id)}
            onOpenNewNotebook={() => setIsNewNotebookOpen(true)}
            onOpenAddSource={(nbId) => {
              if (nbId) setActiveNotebookId(nbId);
              setIsAddSourceOpen(true);
            }}
            onToggleFavorite={handleToggleFavorite}
            onArchiveNotebook={handleArchiveNotebook}
            onDeletePermanently={handleDeletePermanently}
            filter={filterMode}
            onSetFilter={(f) => setFilterMode(f)}
            onOpenSearch={() => setIsSearchOpen(true)}
          />
        ) : (
          <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden">
            {/* Notebook Top Workspace Header */}
            <NotebookHeader
              notebook={activeNotebook}
              sources={notebookSources}
              onBackToHome={() => setActiveNotebookId(null)}
              onUpdateNotebook={handleUpdateNotebook}
              onOpenAddSource={() => setIsAddSourceOpen(true)}
              onOpenExport={() => setIsExportOpen(true)}
              onOpenSearch={() => setIsSearchOpen(true)}
              geminiConfigured={geminiConfigured}
            />

            {/* 3-Column Desktop Workspace & Responsive Mobile Tabs */}
            <div className="flex-1 flex h-full min-h-0 overflow-hidden pb-12 md:pb-0">
              {/* Left Column: Sources & Literature */}
              <div
                className={`h-full md:block ${
                  activeWorkspaceTab === 'sources' ? 'block w-full' : 'hidden'
                }`}
              >
                <SourcesPanel
                  sources={notebookSources}
                  onToggleSelect={handleToggleSourceSelect}
                  onToggleSelectAll={handleToggleSelectAll}
                  onOpenAddSource={() => setIsAddSourceOpen(true)}
                  onPreviewSource={(src) => setPreviewingSource(src)}
                  onDeleteSource={handleDeleteSource}
                  onRenameSource={handleRenameSource}
                />
              </div>

              {/* Center Column: Grounded AI Chat Workspace */}
              <div
                className={`flex-1 h-full min-w-0 md:block ${
                  activeWorkspaceTab === 'chat' ? 'block w-full' : 'hidden'
                }`}
              >
                <ChatWorkspace
                  messages={notebookMessages}
                  sources={notebookSources}
                  notebookTitle={activeNotebook.title}
                  onSendMessage={handleSendMessage}
                  onRegenerate={handleRegenerateMessage}
                  onSaveMessageToStudio={handleSaveMessageToStudio}
                  onPreviewSourceById={(sourceId) => {
                    const found = notebookSources.find((s) => s.id === sourceId);
                    if (found) setPreviewingSource(found);
                  }}
                  onOpenAddSource={() => setIsAddSourceOpen(true)}
                  isLoading={isChatLoading}
                />
              </div>

              {/* Right Column: Generative Studio Artifacts */}
              <div
                className={`h-full md:block ${
                  activeWorkspaceTab === 'studio' ? 'block w-full' : 'hidden'
                }`}
              >
                <StudioPanel
                  sources={notebookSources}
                  notebookTitle={activeNotebook.title}
                  savedItems={notebookSavedItems}
                  onSaveItem={handleSaveStudioItem}
                  onDeleteItem={handleDeleteStudioItem}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Global Modals */}
      {isAddSourceOpen && activeNotebook && (
        <AddSourceModal
          isOpen={isAddSourceOpen}
          notebookId={activeNotebook.id}
          onClose={() => setIsAddSourceOpen(false)}
          onAddSource={handleAddSource}
        />
      )}

      {previewingSource && (
        <SourceReaderModal
          source={previewingSource}
          onClose={() => setPreviewingSource(null)}
          onToggleSelect={handleToggleSourceSelect}
        />
      )}

      {isSearchOpen && (
        <GlobalSearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          notebooks={notebooks}
          sources={sources}
          messages={messages}
          savedItems={savedItems}
          onSelectNotebook={(id) => {
            setActiveNotebookId(id);
            setIsSearchOpen(false);
          }}
          onPreviewSource={(src) => {
            setActiveNotebookId(src.notebookId);
            setPreviewingSource(src);
            setIsSearchOpen(false);
          }}
        />
      )}

      {isProfileOpen && (
        <UserProfileModal
          isOpen={isProfileOpen}
          currentUser={currentUser}
          onClose={() => setIsProfileOpen(false)}
          onSwitchUser={handleSwitchUser}
          onClearUserData={handleClearUserData}
        />
      )}

      {isNewNotebookOpen && (
        <NewNotebookModal
          isOpen={isNewNotebookOpen}
          userId={currentUser.id}
          onClose={() => setIsNewNotebookOpen(false)}
          onCreateNotebook={handleCreateNotebook}
        />
      )}

      {isExportOpen && activeNotebook && (
        <ShareExportModal
          isOpen={isExportOpen}
          notebook={activeNotebook}
          sources={notebookSources}
          messages={notebookMessages}
          savedItems={notebookSavedItems}
          onClose={() => setIsExportOpen(false)}
        />
      )}
    </div>
  );
};

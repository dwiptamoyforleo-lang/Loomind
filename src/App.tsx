import React, { useState, useEffect, useCallback, useRef } from 'react';
import { LoomindData, ThoughtNode, WeaveConnection, CanvasViewport, CanvasMode } from './types';
import { INITIAL_DATA } from './data/initialData';
import { applyAutoLayout, buildChildrenMap } from './utils/layout';
import { Toolbar } from './components/Toolbar';
import { Canvas } from './components/Canvas';
import { NodeDrawer } from './components/NodeDrawer';
import { Minimap } from './components/Minimap';
import { TemplatesModal } from './components/TemplatesModal';
import { ExportModal } from './components/ExportModal';
import { Sparkles, Command, HelpCircle } from 'lucide-react';

const STORAGE_KEY = 'loomind_mindmap_v1';

export const App: React.FC = () => {
  // Load initial data from localStorage if available
  const [data, setData] = useState<LoomindData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.nodes && parsed.rootId && parsed.nodes[parsed.rootId]) {
          return parsed;
        }
      }
    } catch {
      // Fall back to default
    }
    return INITIAL_DATA;
  });

  // Undo / Redo history
  const [historyPast, setHistoryPast] = useState<LoomindData[]>([]);
  const [historyFuture, setHistoryFuture] = useState<LoomindData[]>([]);

  // Viewport
  const [viewport, setViewport] = useState<CanvasViewport>({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    zoom: 1,
  });

  // UI state
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [mode, setMode] = useState<CanvasMode>('select');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);

  // Auto-save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }, [data]);

  // Push state to undo history
  const pushHistory = useCallback(
    (newData: LoomindData) => {
      setHistoryPast((past) => [...past.slice(-25), data]);
      setHistoryFuture([]);
      setData(newData);
    },
    [data]
  );

  const handleUndo = useCallback(() => {
    if (historyPast.length === 0) return;
    const previous = historyPast[historyPast.length - 1];
    setHistoryPast((past) => past.slice(0, -1));
    setHistoryFuture((future) => [data, ...future]);
    setData(previous);
  }, [historyPast, data]);

  const handleRedo = useCallback(() => {
    if (historyFuture.length === 0) return;
    const next = historyFuture[0];
    setHistoryFuture((future) => future.slice(1));
    setHistoryPast((past) => [...past, data]);
    setData(next);
  }, [historyFuture, data]);

  // Search matches
  const searchResultsCount = React.useMemo(() => {
    if (!searchQuery.trim()) return 0;
    const q = searchQuery.toLowerCase();
    return Object.values(data.nodes).filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        (n.notes && n.notes.toLowerCase().includes(q)) ||
        (n.tags && n.tags.some((t) => t.toLowerCase().includes(q)))
    ).length;
  }, [data.nodes, searchQuery]);

  // Center / fit to view
  const handleResetView = () => {
    setViewport({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      zoom: 1,
    });
  };

  const handleFitView = () => {
    const nodeList = Object.values(data.nodes);
    if (nodeList.length === 0) return;

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    for (const n of nodeList) {
      if (n.x < minX) minX = n.x;
      if (n.x > maxX) maxX = n.x;
      if (n.y < minY) minY = n.y;
      if (n.y > maxY) maxY = n.y;
    }

    const width = Math.max(maxX - minX + 400, 400);
    const height = Math.max(maxY - minY + 300, 300);

    const zoomX = window.innerWidth / width;
    const zoomY = (window.innerHeight - 56) / height;
    const newZoom = Math.min(Math.max(Math.min(zoomX, zoomY) * 0.85, 0.4), 1.3);

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    setViewport({
      x: window.innerWidth / 2 - centerX * newZoom,
      y: (window.innerHeight + 56) / 2 - centerY * newZoom,
      zoom: newZoom,
    });
  };

  // Node operations
  const handleAddChild = (parentId: string) => {
    const parent = data.nodes[parentId];
    if (!parent) return;

    const newId = `node_${Date.now()}`;
    const childrenMap = buildChildrenMap(data.nodes);
    const siblings = childrenMap[parentId] || [];

    // Direction based on parent placement relative to root
    const isRight = parent.x >= 0;
    const xOffset = isRight ? 260 : -260;
    const yOffset = (siblings.length - 1) * 70;

    const childNode: ThoughtNode = {
      id: newId,
      title: 'New Thought',
      parentId,
      x: parent.x + xOffset,
      y: parent.y + yOffset,
      color: parent.color,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    pushHistory({
      ...data,
      nodes: {
        ...data.nodes,
        [parentId]: { ...parent, isCollapsed: false },
        [newId]: childNode,
      },
      updatedAt: Date.now(),
    });

    setSelectedNodeId(newId);
  };

  const handleAddSibling = (siblingId: string) => {
    const sibling = data.nodes[siblingId];
    if (!sibling || !sibling.parentId) return;

    const newId = `node_${Date.now()}`;
    const newNode: ThoughtNode = {
      id: newId,
      title: 'New Sibling',
      parentId: sibling.parentId,
      x: sibling.x,
      y: sibling.y + 80,
      color: sibling.color,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    pushHistory({
      ...data,
      nodes: {
        ...data.nodes,
        [newId]: newNode,
      },
      updatedAt: Date.now(),
    });

    setSelectedNodeId(newId);
  };

  const handleDeleteNode = (id: string) => {
    if (id === data.rootId) return; // cannot delete root

    const childrenMap = buildChildrenMap(data.nodes);
    const idsToDelete = new Set<string>();

    const collectDescendants = (nodeId: string) => {
      idsToDelete.add(nodeId);
      const children = childrenMap[nodeId] || [];
      for (const childId of children) {
        collectDescendants(childId);
      }
    };
    collectDescendants(id);

    const remainingNodes = { ...data.nodes };
    for (const dId of idsToDelete) {
      delete remainingNodes[dId];
    }

    // Filter out weaves connected to deleted nodes
    const remainingWeaves = data.weaves.filter(
      (w) => !idsToDelete.has(w.fromId) && !idsToDelete.has(w.toId)
    );

    pushHistory({
      ...data,
      nodes: remainingNodes,
      weaves: remainingWeaves,
      updatedAt: Date.now(),
    });

    if (selectedNodeId && idsToDelete.has(selectedNodeId)) {
      setSelectedNodeId(null);
      setIsDrawerOpen(false);
    }
  };

  const handleUpdateNodeTitle = (id: string, newTitle: string) => {
    const node = data.nodes[id];
    if (!node || node.title === newTitle) return;

    pushHistory({
      ...data,
      nodes: {
        ...data.nodes,
        [id]: { ...node, title: newTitle, updatedAt: Date.now() },
      },
      updatedAt: Date.now(),
    });
  };

  const handleToggleCollapse = (id: string) => {
    const node = data.nodes[id];
    if (!node) return;

    setData((prev) => ({
      ...prev,
      nodes: {
        ...prev.nodes,
        [id]: { ...node, isCollapsed: !node.isCollapsed },
      },
    }));
  };

  const handleMoveNode = (id: string, x: number, y: number) => {
    setData((prev) => {
      const node = prev.nodes[id];
      if (!node) return prev;
      return {
        ...prev,
        nodes: {
          ...prev.nodes,
          [id]: { ...node, x, y },
        },
      };
    });
  };

  const handleAutoLayout = () => {
    const reordered = applyAutoLayout(data.nodes, data.rootId);
    pushHistory({
      ...data,
      nodes: reordered,
      updatedAt: Date.now(),
    });
  };

  // Weave connections
  const handleCreateWeave = (fromId: string, toId: string) => {
    if (fromId === toId) return;
    // Check if weave already exists
    const exists = data.weaves.some(
      (w) =>
        (w.fromId === fromId && w.toId === toId) || (w.fromId === toId && w.toId === fromId)
    );
    if (exists) return;

    const newWeave: WeaveConnection = {
      id: `w_${Date.now()}`,
      fromId,
      toId,
      label: 'relates to',
      style: 'curved',
    };

    pushHistory({
      ...data,
      weaves: [...data.weaves, newWeave],
      updatedAt: Date.now(),
    });
  };

  const handleDeleteWeave = (weaveId: string) => {
    pushHistory({
      ...data,
      weaves: data.weaves.filter((w) => w.id !== weaveId),
      updatedAt: Date.now(),
    });
  };

  const handleUpdateWeaveLabel = (weaveId: string, label: string) => {
    setData((prev) => ({
      ...prev,
      weaves: prev.weaves.map((w) => (w.id === weaveId ? { ...w, label } : w)),
    }));
  };

  const handleUpdateNode = (updatedNode: ThoughtNode) => {
    pushHistory({
      ...data,
      nodes: {
        ...data.nodes,
        [updatedNode.id]: updatedNode,
      },
      updatedAt: Date.now(),
    });
  };

  const selectedNode = selectedNodeId ? data.nodes[selectedNodeId] || null : null;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-50 font-sans">
      {/* Top Application Bar */}
      <Toolbar
        title={data.title}
        zoom={viewport.zoom}
        mode={mode}
        canUndo={historyPast.length > 0}
        canRedo={historyFuture.length > 0}
        searchQuery={searchQuery}
        searchResultsCount={searchResultsCount}
        hasSelectedNode={Boolean(selectedNodeId)}
        onUpdateTitle={(title) => setData((prev) => ({ ...prev, title }))}
        onAddNode={() => {
          if (selectedNodeId) {
            handleAddChild(selectedNodeId);
          } else {
            handleAddChild(data.rootId);
          }
        }}
        onStartWeave={() => {
          if (selectedNodeId) {
            // Handled via canvas weave mode
          }
        }}
        onAutoLayout={handleAutoLayout}
        onResetView={handleResetView}
        onFitView={handleFitView}
        onZoomIn={() =>
          setViewport((prev) => ({ ...prev, zoom: Math.min(prev.zoom * 1.2, 2.5) }))
        }
        onZoomOut={() =>
          setViewport((prev) => ({ ...prev, zoom: Math.max(prev.zoom / 1.2, 0.2) }))
        }
        onZoomReset={() => setViewport((prev) => ({ ...prev, zoom: 1 }))}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onSearchChange={setSearchQuery}
        onOpenTemplates={() => setIsTemplatesOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
      />

      {/* Interactive Mind Map Canvas */}
      <Canvas
        nodes={data.nodes}
        weaves={data.weaves}
        rootId={data.rootId}
        viewport={viewport}
        mode={mode}
        selectedNodeId={selectedNodeId}
        searchQuery={searchQuery}
        onViewportChange={setViewport}
        onSelectNode={(id) => {
          setSelectedNodeId(id);
          if (id) {
            setIsDrawerOpen(true);
          }
        }}
        onInspectNode={(id) => {
          setSelectedNodeId(id);
          setIsDrawerOpen(true);
        }}
        onUpdateNodeTitle={handleUpdateNodeTitle}
        onToggleCollapse={handleToggleCollapse}
        onAddChild={handleAddChild}
        onAddSibling={handleAddSibling}
        onDeleteNode={handleDeleteNode}
        onMoveNode={handleMoveNode}
        onCreateWeave={handleCreateWeave}
        onDeleteWeave={handleDeleteWeave}
      />

      {/* Minimap Radar */}
      <Minimap
        nodes={data.nodes}
        viewport={viewport}
        onPanTo={(worldX, worldY) => {
          setViewport((prev) => ({
            ...prev,
            x: window.innerWidth / 2 - worldX * prev.zoom,
            y: window.innerHeight / 2 - worldY * prev.zoom,
          }));
        }}
      />

      {/* Selected Node Details Drawer */}
      {isDrawerOpen && selectedNode && (
        <NodeDrawer
          node={selectedNode}
          allNodes={data.nodes}
          weaves={data.weaves}
          isRoot={selectedNode.id === data.rootId}
          onClose={() => setIsDrawerOpen(false)}
          onUpdateNode={handleUpdateNode}
          onDeleteNode={handleDeleteNode}
          onAddChild={handleAddChild}
          onStartWeave={(id) => {
            // Trigger weave connecting
          }}
          onDeleteWeave={handleDeleteWeave}
          onUpdateWeaveLabel={handleUpdateWeaveLabel}
        />
      )}

      {/* Bottom Shortcuts Floating Pill */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
        <button
          onClick={() => setShowShortcutsHelp(!showShortcutsHelp)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-xl border border-slate-200 shadow-sm text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
          <span className="hidden sm:inline">Shortcuts</span>
        </button>

        {showShortcutsHelp && (
          <div className="bg-white/95 backdrop-blur-md rounded-xl border border-slate-200 shadow-lg px-3 py-2 text-[11px] text-slate-600 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
            <span>
              <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded font-semibold text-slate-800">
                Tab
              </kbd>{' '}
              Add child
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded font-semibold text-slate-800">
                Enter
              </kbd>{' '}
              Add sibling
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded font-semibold text-slate-800">
                Del
              </kbd>{' '}
              Remove
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded font-semibold text-slate-800">
                Drag
              </kbd>{' '}
              Move & Pan
            </span>
          </div>
        )}
      </div>

      {/* Modals */}
      <TemplatesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onSelectTemplate={(newTemplate) => {
          pushHistory(newTemplate);
          setSelectedNodeId(null);
          handleResetView();
        }}
      />

      <ExportModal
        isOpen={isExportOpen}
        data={data}
        onClose={() => setIsExportOpen(false)}
        onImportData={(importedData) => {
          pushHistory(importedData);
          setSelectedNodeId(null);
          handleResetView();
        }}
      />
    </div>
  );
};

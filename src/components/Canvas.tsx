import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ThoughtNode, WeaveConnection, CanvasViewport, CanvasMode, DraggingState } from '../types';
import { ThoughtNodeComponent } from './ThoughtNodeComponent';
import { getBezierPath, buildChildrenMap } from '../utils/layout';
import { X, ArrowRight } from 'lucide-react';

interface CanvasProps {
  nodes: Record<string, ThoughtNode>;
  weaves: WeaveConnection[];
  rootId: string;
  viewport: CanvasViewport;
  mode: CanvasMode;
  selectedNodeId: string | null;
  searchQuery: string;
  onViewportChange: (viewport: CanvasViewport) => void;
  onSelectNode: (id: string | null) => void;
  onInspectNode: (id: string) => void;
  onUpdateNodeTitle: (id: string, newTitle: string) => void;
  onToggleCollapse: (id: string) => void;
  onAddChild: (parentId: string) => void;
  onAddSibling: (siblingId: string) => void;
  onDeleteNode: (id: string) => void;
  onMoveNode: (id: string, x: number, y: number) => void;
  onCreateWeave: (fromId: string, toId: string) => void;
  onDeleteWeave: (weaveId: string) => void;
}

export const Canvas: React.FC<CanvasProps> = ({
  nodes,
  weaves,
  rootId,
  viewport,
  mode,
  selectedNodeId,
  searchQuery,
  onViewportChange,
  onSelectNode,
  onInspectNode,
  onUpdateNodeTitle,
  onToggleCollapse,
  onAddChild,
  onAddSibling,
  onDeleteNode,
  onMoveNode,
  onCreateWeave,
  onDeleteWeave,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [draggingNode, setDraggingNode] = useState<DraggingState | null>(null);
  const [weaveSourceId, setWeaveSourceId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hoveredWeaveId, setHoveredWeaveId] = useState<string | null>(null);

  const childrenMap = buildChildrenMap(nodes);

  // Compute set of visible node IDs based on collapsed parents
  const visibleNodeIds = new Set<string>();
  const computeVisibility = (nodeId: string) => {
    visibleNodeIds.add(nodeId);
    const node = nodes[nodeId];
    if (node && !node.isCollapsed) {
      const children = childrenMap[nodeId] || [];
      for (const childId of children) {
        computeVisibility(childId);
      }
    }
  };
  computeVisibility(rootId);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input or textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.key === 'Tab' && selectedNodeId) {
        e.preventDefault();
        onAddChild(selectedNodeId);
      } else if (e.key === 'Enter' && selectedNodeId && selectedNodeId !== rootId) {
        e.preventDefault();
        onAddSibling(selectedNodeId);
      } else if (
        (e.key === 'Backspace' || e.key === 'Delete') &&
        selectedNodeId &&
        selectedNodeId !== rootId
      ) {
        e.preventDefault();
        onDeleteNode(selectedNodeId);
      } else if (e.key === 'Escape') {
        onSelectNode(null);
        setWeaveSourceId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, rootId, onAddChild, onAddSibling, onDeleteNode, onSelectNode]);

  // Convert client coordinates to canvas world coordinates
  const clientToWorld = useCallback(
    (clientX: number, clientY: number) => {
      if (!containerRef.current) return { x: 0, y: 0 };
      const rect = containerRef.current.getBoundingClientRect();
      const screenX = clientX - rect.left;
      const screenY = clientY - rect.top;
      const worldX = (screenX - viewport.x) / viewport.zoom;
      const worldY = (screenY - viewport.y) / viewport.zoom;
      return { x: worldX, y: worldY };
    },
    [viewport]
  );

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // If clicked on canvas background
    if (e.target === containerRef.current || (e.target as HTMLElement).id === 'canvas-svg') {
      onSelectNode(null);
      setWeaveSourceId(null);
      setIsPanning(true);
      setPanStart({ x: e.clientX - viewport.x, y: e.clientY - viewport.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const world = clientToWorld(e.clientX, e.clientY);
    setMousePos(world);

    if (isPanning) {
      onViewportChange({
        ...viewport,
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    } else if (draggingNode) {
      const dx = (e.clientX - draggingNode.startX) / viewport.zoom;
      const dy = (e.clientY - draggingNode.startY) / viewport.zoom;
      onMoveNode(
        draggingNode.nodeId,
        Math.round(draggingNode.initialNodeX + dx),
        Math.round(draggingNode.initialNodeY + dy)
      );
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingNode(null);
  };

  // Zoom with wheel
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseScreenX = e.clientX - rect.left;
    const mouseScreenY = e.clientY - rect.top;

    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const newZoom = Math.min(Math.max(viewport.zoom * zoomFactor, 0.2), 2.5);

    // Zoom centered on cursor
    const newX = mouseScreenX - (mouseScreenX - viewport.x) * (newZoom / viewport.zoom);
    const newY = mouseScreenY - (mouseScreenY - viewport.y) * (newZoom / viewport.zoom);

    onViewportChange({
      x: newX,
      y: newY,
      zoom: newZoom,
    });
  };

  const handleNodeMouseDown = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (weaveSourceId) {
      if (weaveSourceId !== nodeId) {
        onCreateWeave(weaveSourceId, nodeId);
        setWeaveSourceId(null);
      }
      return;
    }

    const node = nodes[nodeId];
    if (node) {
      setDraggingNode({
        nodeId,
        startX: e.clientX,
        startY: e.clientY,
        initialNodeX: node.x,
        initialNodeY: node.y,
      });
      onSelectNode(nodeId);
    }
  };

  const handleStartWeave = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWeaveSourceId(nodeId);
    onSelectNode(nodeId);
  };

  return (
    <div
      ref={containerRef}
      id="loomind-canvas-container"
      className="relative w-full h-full overflow-hidden bg-slate-50 select-none cursor-default"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Background Dot Grid */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="dot-grid"
            width={24 * viewport.zoom}
            height={24 * viewport.zoom}
            patternUnits="userSpaceOnUse"
            patternTransform={`translate(${viewport.x % (24 * viewport.zoom)}, ${
              viewport.y % (24 * viewport.zoom)
            })`}
          >
            <circle cx="2" cy="2" r={1 * Math.min(viewport.zoom, 1.2)} fill="#94a3b8" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dot-grid)" />
      </svg>

      {/* World Transform Layer */}
      <div
        id="canvas-world"
        style={{
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
          transformOrigin: '0 0',
        }}
        className="absolute inset-0 pointer-events-auto"
      >
        {/* SVG Connections Layer */}
        <svg
          id="canvas-svg"
          className="absolute -top-[50000px] -left-[50000px] w-[100000px] h-[100000px] pointer-events-auto overflow-visible"
        >
          {/* Defs for arrow markers and gradients */}
          <defs>
            <marker
              id="weave-arrow"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 8 5 L 0 9 z" fill="#8b5cf6" />
            </marker>
          </defs>

          {/* 1. Standard Parent -> Child Branches */}
          {Array.from(visibleNodeIds).map((nodeId) => {
            const node = nodes[nodeId];
            if (!node || !node.parentId || !visibleNodeIds.has(node.parentId)) return null;
            const parent = nodes[node.parentId];
            if (!parent) return null;

            const path = getBezierPath(parent.x, parent.y, node.x, node.y);

            return (
              <g key={`branch-${parent.id}-${node.id}`}>
                <path
                  d={path}
                  fill="none"
                  stroke="#cbd5e1"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  className="transition-colors"
                />
              </g>
            );
          })}

          {/* 2. Weave Connections (Lateral cross-branch links) */}
          {weaves.map((weave) => {
            if (!visibleNodeIds.has(weave.fromId) || !visibleNodeIds.has(weave.toId)) return null;
            const fromNode = nodes[weave.fromId];
            const toNode = nodes[weave.toId];
            if (!fromNode || !toNode) return null;

            const path = getBezierPath(fromNode.x, fromNode.y, toNode.x, toNode.y);
            const midX = (fromNode.x + toNode.x) / 2;
            const midY = (fromNode.y + toNode.y) / 2;
            const isHovered = hoveredWeaveId === weave.id;

            return (
              <g
                key={`weave-${weave.id}`}
                className="cursor-pointer group"
                onMouseEnter={() => setHoveredWeaveId(weave.id)}
                onMouseLeave={() => setHoveredWeaveId(null)}
              >
                {/* Thick invisible hover target */}
                <path d={path} fill="none" stroke="transparent" strokeWidth={16} />
                {/* Visible stylized path */}
                <path
                  d={path}
                  fill="none"
                  stroke={isHovered ? '#7c3aed' : '#8b5cf6'}
                  strokeWidth={isHovered ? 3 : 2}
                  strokeDasharray={weave.style === 'dashed' ? '6,4' : undefined}
                  markerEnd="url(#weave-arrow)"
                  className="transition-all"
                />

                {/* Weave Label / Delete badge */}
                <foreignObject
                  x={midX - 70}
                  y={midY - 14}
                  width={140}
                  height={28}
                  className="overflow-visible"
                >
                  <div className="flex items-center justify-center">
                    <div
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border shadow-xs transition-all ${
                        isHovered
                          ? 'bg-violet-600 text-white border-violet-700 shadow-md scale-105'
                          : 'bg-violet-50 text-violet-700 border-violet-200'
                      }`}
                    >
                      <span className="truncate max-w-[90px]">
                        {weave.label || 'intertwines with'}
                      </span>
                      {isHovered && (
                        <button
                          title="Remove Weave"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteWeave(weave.id);
                          }}
                          className="hover:bg-violet-700 p-0.5 rounded-full"
                        >
                          <X className="w-2.5 h-2.5 text-white" />
                        </button>
                      )}
                    </div>
                  </div>
                </foreignObject>
              </g>
            );
          })}

          {/* 3. In-progress Weave Drag Line */}
          {weaveSourceId && nodes[weaveSourceId] && (
            <path
              d={getBezierPath(
                nodes[weaveSourceId].x,
                nodes[weaveSourceId].y,
                mousePos.x,
                mousePos.y
              )}
              fill="none"
              stroke="#8b5cf6"
              strokeWidth={2.5}
              strokeDasharray="4,4"
              className="animate-pulse"
            />
          )}
        </svg>

        {/* HTML Nodes Layer */}
        {Array.from(visibleNodeIds).map((nodeId) => {
          const node = nodes[nodeId];
          if (!node) return null;

          const isMatch =
            searchQuery.trim().length > 0 &&
            (node.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (node.notes && node.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
              (node.tags && node.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))));

          return (
            <ThoughtNodeComponent
              key={node.id}
              node={node}
              isSelected={selectedNodeId === node.id}
              isWeaveSource={weaveSourceId === node.id}
              isWeaveTargetCandidate={Boolean(weaveSourceId && weaveSourceId !== node.id)}
              hasChildren={(childrenMap[node.id] || []).length > 0}
              childrenCount={(childrenMap[node.id] || []).length}
              isSearchMatch={isMatch}
              onSelect={(id, e) => {
                e.stopPropagation();
                if (weaveSourceId) {
                  if (weaveSourceId !== id) {
                    onCreateWeave(weaveSourceId, id);
                    setWeaveSourceId(null);
                  }
                } else {
                  onSelectNode(id);
                }
              }}
              onDoubleClick={(id) => onInspectNode(id)}
              onUpdateTitle={onUpdateNodeTitle}
              onToggleCollapse={(id, e) => {
                e.stopPropagation();
                onToggleCollapse(id);
              }}
              onAddChild={(parentId, e) => {
                e.stopPropagation();
                onAddChild(parentId);
              }}
              onStartWeave={handleStartWeave}
              onMouseDown={handleNodeMouseDown}
            />
          );
        })}
      </div>

      {/* Weave Connecting Mode Alert Banner */}
      {weaveSourceId && (
        <div className="absolute top-18 left-1/2 -translate-x-1/2 z-40 bg-violet-900/90 text-white backdrop-blur-md px-4 py-2 rounded-full shadow-lg flex items-center gap-2.5 text-xs font-medium border border-violet-700 animate-in fade-in slide-in-from-top-2">
          <span>
            Click another thought to weave from <strong>{nodes[weaveSourceId]?.title}</strong>
          </span>
          <button
            onClick={() => setWeaveSourceId(null)}
            className="text-violet-200 hover:text-white px-2 py-0.5 rounded bg-violet-800 hover:bg-violet-700 text-[11px]"
          >
            Cancel (Esc)
          </button>
        </div>
      )}
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Cpu,
  GitFork,
  GitPullRequest,
  Lightbulb,
  Zap,
  BookOpen,
  Target,
  CheckCircle2,
  Share2,
  Palette,
  Compass,
  Plus,
  ChevronRight,
  ChevronDown,
  Link,
  Edit3,
  Bookmark,
  Layers,
  HelpCircle,
  Flame,
} from 'lucide-react';
import { ThoughtNode, NodeColorTheme } from '../types';

export const ICON_MAP: Record<string, React.ElementType> = {
  Sparkles,
  Cpu,
  GitFork,
  GitPullRequest,
  Lightbulb,
  Zap,
  BookOpen,
  Target,
  CheckCircle2,
  Share2,
  Palette,
  Compass,
  Bookmark,
  Layers,
  HelpCircle,
  Flame,
};

const COLOR_THEMES: Record<
  NodeColorTheme,
  {
    bg: string;
    border: string;
    text: string;
    badge: string;
    accent: string;
    ring: string;
  }
> = {
  indigo: {
    bg: 'bg-indigo-50/90 hover:bg-indigo-50',
    border: 'border-indigo-300 shadow-indigo-100/50',
    text: 'text-indigo-950',
    badge: 'bg-indigo-100 text-indigo-700',
    accent: 'text-indigo-600',
    ring: 'ring-indigo-500',
  },
  emerald: {
    bg: 'bg-emerald-50/90 hover:bg-emerald-50',
    border: 'border-emerald-300 shadow-emerald-100/50',
    text: 'text-emerald-950',
    badge: 'bg-emerald-100 text-emerald-700',
    accent: 'text-emerald-600',
    ring: 'ring-emerald-500',
  },
  amber: {
    bg: 'bg-amber-50/90 hover:bg-amber-50',
    border: 'border-amber-300 shadow-amber-100/50',
    text: 'text-amber-950',
    badge: 'bg-amber-100 text-amber-800',
    accent: 'text-amber-600',
    ring: 'ring-amber-500',
  },
  rose: {
    bg: 'bg-rose-50/90 hover:bg-rose-50',
    border: 'border-rose-300 shadow-rose-100/50',
    text: 'text-rose-950',
    badge: 'bg-rose-100 text-rose-700',
    accent: 'text-rose-600',
    ring: 'ring-rose-500',
  },
  sky: {
    bg: 'bg-sky-50/90 hover:bg-sky-50',
    border: 'border-sky-300 shadow-sky-100/50',
    text: 'text-sky-950',
    badge: 'bg-sky-100 text-sky-700',
    accent: 'text-sky-600',
    ring: 'ring-sky-500',
  },
  violet: {
    bg: 'bg-violet-50/90 hover:bg-violet-50',
    border: 'border-violet-300 shadow-violet-100/50',
    text: 'text-violet-950',
    badge: 'bg-violet-100 text-violet-700',
    accent: 'text-violet-600',
    ring: 'ring-violet-500',
  },
  slate: {
    bg: 'bg-slate-50/95 hover:bg-slate-50',
    border: 'border-slate-300 shadow-slate-100/50',
    text: 'text-slate-900',
    badge: 'bg-slate-200 text-slate-700',
    accent: 'text-slate-600',
    ring: 'ring-slate-500',
  },
};

interface ThoughtNodeProps {
  node: ThoughtNode;
  isSelected: boolean;
  isWeaveSource: boolean;
  isWeaveTargetCandidate: boolean;
  hasChildren: boolean;
  childrenCount: number;
  isSearchMatch?: boolean;
  onSelect: (id: string, e: React.MouseEvent) => void;
  onDoubleClick: (id: string) => void;
  onUpdateTitle: (id: string, newTitle: string) => void;
  onToggleCollapse: (id: string, e: React.MouseEvent) => void;
  onAddChild: (parentId: string, e: React.MouseEvent) => void;
  onStartWeave: (nodeId: string, e: React.MouseEvent) => void;
  onMouseDown: (nodeId: string, e: React.MouseEvent) => void;
}

export const ThoughtNodeComponent: React.FC<ThoughtNodeProps> = ({
  node,
  isSelected,
  isWeaveSource,
  isWeaveTargetCandidate,
  hasChildren,
  childrenCount,
  isSearchMatch,
  onSelect,
  onDoubleClick,
  onUpdateTitle,
  onToggleCollapse,
  onAddChild,
  onStartWeave,
  onMouseDown,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(node.title);
  const inputRef = useRef<HTMLInputElement>(null);

  const theme = COLOR_THEMES[node.color] || COLOR_THEMES.indigo;
  const isRoot = !node.parentId;

  useEffect(() => {
    setEditTitle(node.title);
  }, [node.title]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleTitleSubmit = () => {
    if (editTitle.trim()) {
      onUpdateTitle(node.id, editTitle.trim());
    } else {
      setEditTitle(node.title);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.stopPropagation();
      handleTitleSubmit();
    } else if (e.key === 'Escape') {
      e.stopPropagation();
      setEditTitle(node.title);
      setIsEditing(false);
    }
  };

  const IconComponent = node.icon ? ICON_MAP[node.icon] || Sparkles : Sparkles;

  return (
    <div
      id={`node-${node.id}`}
      style={{
        transform: `translate(${node.x}px, ${node.y}px)`,
      }}
      className={`group absolute top-0 left-0 -ml-[110px] -mt-[32px] w-[220px] transition-shadow cursor-grab active:cursor-grabbing ${
        isSelected ? 'z-30' : 'z-10'
      }`}
      onMouseDown={(e) => onMouseDown(node.id, e)}
      onClick={(e) => onSelect(node.id, e)}
      onDoubleClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
      }}
    >
      <div
        className={`relative rounded-2xl border p-3 shadow-md backdrop-blur-md transition-all duration-150 ${
          theme.bg
        } ${theme.border} ${theme.text} ${
          isSelected ? `ring-2 ring-offset-2 ${theme.ring} shadow-lg scale-[1.02]` : ''
        } ${isWeaveSource ? 'ring-2 ring-offset-2 ring-violet-600 animate-pulse' : ''} ${
          isWeaveTargetCandidate ? 'ring-2 ring-offset-1 ring-emerald-500 hover:scale-105' : ''
        } ${isSearchMatch ? 'ring-4 ring-amber-400 bg-amber-50' : ''}`}
      >
        {/* Top bar: Icon & Badges */}
        <div className="flex items-center justify-between gap-1.5 mb-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className={`p-1 rounded-lg ${theme.badge} shrink-0`}
              title={node.icon || 'Thought'}
            >
              <IconComponent className="w-3.5 h-3.5" />
            </span>
            {isRoot && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-indigo-600 text-white shrink-0">
                Root
              </span>
            )}
            {node.status && (
              <span
                className={`text-[10px] font-medium capitalize px-1.5 py-0.2 rounded-md ${
                  node.status === 'completed'
                    ? 'bg-emerald-100 text-emerald-800'
                    : node.status === 'in-progress'
                    ? 'bg-blue-100 text-blue-800'
                    : node.status === 'blocked'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {node.status.replace('-', ' ')}
              </span>
            )}
          </div>

          <button
            id={`node-edit-btn-${node.id}`}
            title="Inspect Details"
            onClick={(e) => {
              e.stopPropagation();
              onDoubleClick(node.id);
            }}
            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-700 p-1 rounded-md transition-opacity"
          >
            <Edit3 className="w-3 h-3" />
          </button>
        </div>

        {/* Title Content */}
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={handleKeyDown}
            className="w-full text-xs font-semibold px-1.5 py-0.5 rounded border border-indigo-400 bg-white text-slate-900 focus:outline-none"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div className="text-xs font-semibold leading-snug line-clamp-2 select-none">
            {node.title}
          </div>
        )}

        {/* Optional Notes Snippet */}
        {node.notes && !isEditing && (
          <p className="mt-1 text-[11px] text-slate-600 line-clamp-1 italic">
            {node.notes}
          </p>
        )}

        {/* Tags */}
        {node.tags && node.tags.length > 0 && !isEditing && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {node.tags.slice(0, 2).map((tag, idx) => (
              <span
                key={idx}
                className="text-[9px] font-medium px-1.5 py-0.2 rounded-full bg-white/70 text-slate-700 border border-slate-200/60"
              >
                #{tag}
              </span>
            ))}
            {node.tags.length > 2 && (
              <span className="text-[9px] text-slate-500">+{node.tags.length - 2}</span>
            )}
          </div>
        )}

        {/* Collapse / Expand Toggle Button if has children */}
        {hasChildren && (
          <button
            id={`node-collapse-btn-${node.id}`}
            onClick={(e) => onToggleCollapse(node.id, e)}
            className={`absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border border-slate-200 bg-white text-slate-600 shadow flex items-center justify-center hover:bg-slate-100 hover:text-indigo-600 transition-transform ${
              node.isCollapsed ? 'bg-indigo-50 text-indigo-700 ring-2 ring-indigo-400' : ''
            }`}
            title={node.isCollapsed ? `Expand ${childrenCount} children` : 'Collapse'}
          >
            {node.isCollapsed ? (
              <div className="flex items-center text-[9px] font-bold">
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        )}

        {/* Quick Hover Action Bar */}
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center gap-1 bg-white border border-slate-200 px-2 py-0.5 rounded-full shadow-md z-20">
          <button
            id={`node-add-child-btn-${node.id}`}
            title="Add Child Thought (or press Tab)"
            onClick={(e) => onAddChild(node.id, e)}
            className="p-1 hover:text-indigo-600 text-slate-600 rounded-full hover:bg-indigo-50 transition-colors"
          >
            <Plus className="w-3 h-3" />
          </button>
          <div className="w-[1px] h-3 bg-slate-200" />
          <button
            id={`node-weave-btn-${node.id}`}
            title="Weave connection to another thought"
            onClick={(e) => onStartWeave(node.id, e)}
            className="p-1 hover:text-violet-600 text-slate-600 rounded-full hover:bg-violet-50 transition-colors"
          >
            <Link className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Tag,
  FileText,
  Palette,
  Flag,
  CheckCircle2,
  GitPullRequest,
  Link,
  Edit2,
} from 'lucide-react';
import {
  ThoughtNode,
  NodeColorTheme,
  NodeStatus,
  NodePriority,
  WeaveConnection,
} from '../types';
import { ICON_MAP } from './ThoughtNodeComponent';

const COLOR_OPTIONS: { key: NodeColorTheme; label: string; class: string }[] = [
  { key: 'indigo', label: 'Indigo', class: 'bg-indigo-500' },
  { key: 'emerald', label: 'Emerald', class: 'bg-emerald-500' },
  { key: 'amber', label: 'Amber', class: 'bg-amber-500' },
  { key: 'rose', label: 'Rose', class: 'bg-rose-500' },
  { key: 'sky', label: 'Sky', class: 'bg-sky-500' },
  { key: 'violet', label: 'Violet', class: 'bg-violet-500' },
  { key: 'slate', label: 'Slate', class: 'bg-slate-500' },
];

const AVAILABLE_ICONS = Object.keys(ICON_MAP);

interface NodeDrawerProps {
  node: ThoughtNode | null;
  allNodes: Record<string, ThoughtNode>;
  weaves: WeaveConnection[];
  isRoot: boolean;
  onClose: () => void;
  onUpdateNode: (updatedNode: ThoughtNode) => void;
  onDeleteNode: (id: string) => void;
  onAddChild: (parentId: string) => void;
  onStartWeave: (nodeId: string) => void;
  onDeleteWeave: (weaveId: string) => void;
  onUpdateWeaveLabel: (weaveId: string, label: string) => void;
}

export const NodeDrawer: React.FC<NodeDrawerProps> = ({
  node,
  allNodes,
  weaves,
  isRoot,
  onClose,
  onUpdateNode,
  onDeleteNode,
  onAddChild,
  onStartWeave,
  onDeleteWeave,
  onUpdateWeaveLabel,
}) => {
  const [newTagInput, setNewTagInput] = useState('');

  if (!node) return null;

  // Filter weaves related to this node
  const relatedWeaves = weaves.filter((w) => w.fromId === node.id || w.toId === node.id);

  const handleAddTag = () => {
    const trimmed = newTagInput.trim().replace(/^#/, '');
    if (trimmed && !(node.tags || []).includes(trimmed)) {
      onUpdateNode({
        ...node,
        tags: [...(node.tags || []), trimmed],
        updatedAt: Date.now(),
      });
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onUpdateNode({
      ...node,
      tags: (node.tags || []).filter((t) => t !== tagToRemove),
      updatedAt: Date.now(),
    });
  };

  return (
    <div
      id="node-inspector-drawer"
      className="absolute right-0 top-14 bottom-0 w-80 sm:w-96 bg-white border-l border-slate-200/90 shadow-xl z-40 flex flex-col animate-in slide-in-from-right-4 duration-200"
    >
      {/* Drawer Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Thought Inspector
          </span>
          {isRoot && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700">
              Root
            </span>
          )}
        </div>
        <button
          id="drawer-close-btn"
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Title */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Thought Title
          </label>
          <input
            id="drawer-title-input"
            type="text"
            value={node.title}
            onChange={(e) =>
              onUpdateNode({ ...node, title: e.target.value, updatedAt: Date.now() })
            }
            className="w-full px-3 py-2 text-sm font-semibold bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {/* Detailed Notes */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Notes & Elaborations
            </label>
            <FileText className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <textarea
            id="drawer-notes-textarea"
            rows={4}
            placeholder="Add detailed thoughts, observations, rationale, or links..."
            value={node.notes || ''}
            onChange={(e) =>
              onUpdateNode({ ...node, notes: e.target.value, updatedAt: Date.now() })
            }
            className="w-full px-3 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none resize-y"
          />
        </div>

        {/* Color Palette */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Color Accent
          </label>
          <div className="flex items-center gap-2">
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c.key}
                onClick={() => onUpdateNode({ ...node, color: c.key, updatedAt: Date.now() })}
                title={c.label}
                className={`w-7 h-7 rounded-full ${c.class} transition-transform ${
                  node.color === c.key
                    ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110 shadow-sm'
                    : 'opacity-70 hover:opacity-100 hover:scale-105'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Status & Priority Row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Status
            </label>
            <select
              value={node.status || 'idea'}
              onChange={(e) =>
                onUpdateNode({
                  ...node,
                  status: e.target.value as NodeStatus,
                  updatedAt: Date.now(),
                })
              }
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-500"
            >
              <option value="idea">Idea</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Priority
            </label>
            <select
              value={node.priority || 'medium'}
              onChange={(e) =>
                onUpdateNode({
                  ...node,
                  priority: e.target.value as NodePriority,
                  updatedAt: Date.now(),
                })
              }
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        {/* Icon Selector */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Symbol / Icon
          </label>
          <div className="grid grid-cols-8 gap-1 bg-slate-50 p-2 rounded-lg border border-slate-200">
            {AVAILABLE_ICONS.map((iconKey) => {
              const IconComp = ICON_MAP[iconKey];
              const isSelected = node.icon === iconKey;
              return (
                <button
                  key={iconKey}
                  onClick={() =>
                    onUpdateNode({ ...node, icon: iconKey, updatedAt: Date.now() })
                  }
                  title={iconKey}
                  className={`p-1.5 rounded-md flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Tags
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {(node.tags || []).map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200"
              >
                #{t}
                <button
                  onClick={() => handleRemoveTag(t)}
                  className="hover:text-rose-600 text-slate-400"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-1.5">
            <input
              type="text"
              placeholder="Add a tag..."
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              className="flex-1 px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={handleAddTag}
              className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-md"
            >
              Add
            </button>
          </div>
        </div>

        {/* Weaved Connections Section */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Connected Weaves ({relatedWeaves.length})
            </label>
            <button
              id="drawer-start-weave-btn"
              onClick={() => onStartWeave(node.id)}
              className="text-[11px] font-medium text-violet-600 hover:text-violet-800 flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Weave New
            </button>
          </div>

          {relatedWeaves.length === 0 ? (
            <p className="text-xs text-slate-400 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-center">
              No cross-thought weaves connected yet.
            </p>
          ) : (
            <div className="space-y-1.5">
              {relatedWeaves.map((w) => {
                const isOrigin = w.fromId === node.id;
                const otherNodeId = isOrigin ? w.toId : w.fromId;
                const otherNode = allNodes[otherNodeId];

                return (
                  <div
                    key={w.id}
                    className="p-2 bg-violet-50/60 border border-violet-100 rounded-lg text-xs flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-medium text-violet-900 truncate">
                        <GitPullRequest className="w-3 h-3 text-violet-600 shrink-0" />
                        <span className="truncate">
                          {isOrigin ? 'To: ' : 'From: '}
                          <strong>{otherNode?.title || otherNodeId}</strong>
                        </span>
                      </div>
                      <button
                        onClick={() => onDeleteWeave(w.id)}
                        className="text-slate-400 hover:text-rose-600 p-0.5 rounded"
                        title="Delete Weave"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    <input
                      type="text"
                      placeholder="Relationship label (e.g. causes, informs)"
                      value={w.label || ''}
                      onChange={(e) => onUpdateWeaveLabel(w.id, e.target.value)}
                      className="w-full text-[11px] px-2 py-0.5 bg-white border border-violet-200 rounded text-slate-700 placeholder:text-slate-400 focus:outline-none"
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Drawer Footer Actions */}
      <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
        <button
          id="drawer-add-child-btn"
          onClick={() => onAddChild(node.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Branch
        </button>

        {!isRoot && (
          <button
            id="drawer-delete-node-btn"
            onClick={() => onDeleteNode(node.id)}
            className="flex items-center gap-1 text-xs font-medium text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

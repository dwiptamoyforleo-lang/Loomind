import React from 'react';
import {
  Sparkles,
  Plus,
  GitPullRequest,
  RotateCcw,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Search,
  Download,
  LayoutGrid,
  FileCode,
  FolderOpen,
  X,
} from 'lucide-react';
import { CanvasMode } from '../types';

interface ToolbarProps {
  title: string;
  zoom: number;
  mode: CanvasMode;
  canUndo: boolean;
  canRedo: boolean;
  searchQuery: string;
  searchResultsCount: number;
  hasSelectedNode: boolean;
  onUpdateTitle: (title: string) => void;
  onAddNode: () => void;
  onStartWeave: () => void;
  onAutoLayout: () => void;
  onResetView: () => void;
  onFitView: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onSearchChange: (query: string) => void;
  onOpenTemplates: () => void;
  onOpenExport: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  title,
  zoom,
  mode,
  canUndo,
  canRedo,
  searchQuery,
  searchResultsCount,
  hasSelectedNode,
  onUpdateTitle,
  onAddNode,
  onStartWeave,
  onAutoLayout,
  onResetView,
  onFitView,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onUndo,
  onRedo,
  onSearchChange,
  onOpenTemplates,
  onOpenExport,
}) => {
  return (
    <header
      id="loomind-top-bar"
      className="absolute top-0 left-0 right-0 h-14 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 flex items-center justify-between shadow-xs select-none"
    >
      {/* Left: Brand + Mindmap Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-bold text-base tracking-tight text-slate-900 hidden sm:inline">
            Loomind
          </span>
        </div>

        <div className="h-4 w-[1px] bg-slate-200 hidden sm:block" />

        {/* Editable Title */}
        <input
          id="map-title-input"
          type="text"
          value={title}
          onChange={(e) => onUpdateTitle(e.target.value)}
          className="text-sm font-semibold text-slate-800 hover:bg-slate-100/80 focus:bg-white focus:ring-1 focus:ring-indigo-400 px-2 py-1 rounded-lg border border-transparent hover:border-slate-200 transition-all max-w-[180px] sm:max-w-[260px] truncate"
          title="Click to rename mind map"
        />
      </div>

      {/* Center: Search & Filter */}
      <div className="flex items-center gap-2 max-w-xs w-full mx-2">
        <div className="relative w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            id="loomind-search-input"
            type="text"
            placeholder="Search thoughts, notes, tags..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-100/80 hover:bg-slate-100 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        {searchQuery && (
          <span className="text-[11px] font-semibold text-slate-500 shrink-0">
            {searchResultsCount} found
          </span>
        )}
      </div>

      {/* Right: Core Actions */}
      <div className="flex items-center gap-1.5">
        {/* Add Thought */}
        <button
          id="toolbar-add-thought-btn"
          onClick={onAddNode}
          title={hasSelectedNode ? 'Add Child Thought (Tab)' : 'Add Thought'}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden md:inline">
            {hasSelectedNode ? 'Add Branch' : 'Add Thought'}
          </span>
        </button>

        {/* Weave link */}
        <button
          id="toolbar-weave-link-btn"
          onClick={onStartWeave}
          disabled={!hasSelectedNode}
          title={
            hasSelectedNode
              ? 'Weave connection from selected thought'
              : 'Select a thought first to weave a connection'
          }
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
            hasSelectedNode
              ? 'text-violet-700 bg-violet-50 border-violet-200 hover:bg-violet-100'
              : 'text-slate-400 bg-slate-50 border-slate-200 cursor-not-allowed'
          }`}
        >
          <GitPullRequest className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Weave</span>
        </button>

        {/* Auto Arrange */}
        <button
          id="toolbar-auto-layout-btn"
          onClick={onAutoLayout}
          title="Auto-arrange tree layout"
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors"
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span className="hidden xl:inline">Auto-Layout</span>
        </button>

        <div className="h-4 w-[1px] bg-slate-200 mx-1 hidden sm:block" />

        {/* Undo / Redo */}
        <button
          id="toolbar-undo-btn"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          className={`p-1.5 rounded-lg border transition-colors ${
            canUndo
              ? 'text-slate-700 hover:bg-slate-100 border-slate-200'
              : 'text-slate-300 border-slate-100 cursor-not-allowed'
          }`}
        >
          <Undo2 className="w-3.5 h-3.5" />
        </button>
        <button
          id="toolbar-redo-btn"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
          className={`p-1.5 rounded-lg border transition-colors ${
            canRedo
              ? 'text-slate-700 hover:bg-slate-100 border-slate-200'
              : 'text-slate-300 border-slate-100 cursor-not-allowed'
          }`}
        >
          <Redo2 className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-[1px] bg-slate-200 mx-1 hidden md:block" />

        {/* Zoom controls */}
        <div className="hidden md:flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          <button
            id="toolbar-zoom-out-btn"
            onClick={onZoomOut}
            title="Zoom Out"
            className="p-1 hover:bg-white text-slate-600 rounded"
          >
            <ZoomOut className="w-3 h-3" />
          </button>
          <button
            id="toolbar-zoom-reset-btn"
            onClick={onZoomReset}
            title="Reset Zoom to 100%"
            className="px-1 text-[11px] font-semibold text-slate-700 hover:bg-white rounded"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            id="toolbar-zoom-in-btn"
            onClick={onZoomIn}
            title="Zoom In"
            className="p-1 hover:bg-white text-slate-600 rounded"
          >
            <ZoomIn className="w-3 h-3" />
          </button>
          <button
            id="toolbar-fit-view-btn"
            onClick={onFitView}
            title="Fit to Center"
            className="p-1 hover:bg-white text-slate-600 rounded"
          >
            <Maximize2 className="w-3 h-3" />
          </button>
        </div>

        <div className="h-4 w-[1px] bg-slate-200 mx-1 hidden sm:block" />

        {/* Templates */}
        <button
          id="toolbar-templates-btn"
          onClick={onOpenTemplates}
          title="Choose a Starter Template"
          className="p-1.5 text-slate-700 hover:text-indigo-600 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
        >
          <FolderOpen className="w-3.5 h-3.5" />
        </button>

        {/* Export / Share */}
        <button
          id="toolbar-export-btn"
          onClick={onOpenExport}
          title="Export as Markdown or JSON"
          className="p-1.5 text-slate-700 hover:text-indigo-600 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};

import React from 'react';
import { X, Sparkles, Server, Compass, Layers, Plus } from 'lucide-react';
import { LoomindData } from '../types';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (data: LoomindData) => void;
}

export const TemplatesModal: React.FC<TemplatesModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  if (!isOpen) return null;

  const handleTemplateClick = (type: string) => {
    const now = Date.now();
    let templateData: LoomindData;

    if (type === 'blank') {
      templateData = {
        id: `loomind-${now}`,
        title: 'Untitled Thought Loom',
        rootId: 'root',
        createdAt: now,
        updatedAt: now,
        nodes: {
          root: {
            id: 'root',
            title: 'Central Idea',
            notes: 'Double-click to edit or press Tab to add branches.',
            parentId: null,
            x: 0,
            y: 0,
            color: 'indigo',
            icon: 'Sparkles',
            createdAt: now,
            updatedAt: now,
          },
        },
        weaves: [],
      };
    } else if (type === 'architecture') {
      templateData = {
        id: `loomind-${now}`,
        title: 'System Architecture Loom',
        rootId: 'root',
        createdAt: now,
        updatedAt: now,
        nodes: {
          root: {
            id: 'root',
            title: 'Platform Architecture',
            parentId: null,
            x: 0,
            y: 0,
            color: 'indigo',
            icon: 'Cpu',
            createdAt: now,
            updatedAt: now,
          },
          fe: {
            id: 'fe',
            title: 'Client Layer (SPA)',
            parentId: 'root',
            x: 300,
            y: -100,
            color: 'sky',
            icon: 'Palette',
            tags: ['frontend'],
            createdAt: now,
            updatedAt: now,
          },
          fe_1: {
            id: 'fe_1',
            title: 'Design System & UI Components',
            parentId: 'fe',
            x: 600,
            y: -140,
            color: 'sky',
            createdAt: now,
            updatedAt: now,
          },
          fe_2: {
            id: 'fe_2',
            title: 'State & Cache Store',
            parentId: 'fe',
            x: 600,
            y: -60,
            color: 'sky',
            createdAt: now,
            updatedAt: now,
          },
          be: {
            id: 'be',
            title: 'Backend API Services',
            parentId: 'root',
            x: 300,
            y: 120,
            color: 'emerald',
            icon: 'Cpu',
            tags: ['server'],
            createdAt: now,
            updatedAt: now,
          },
          be_1: {
            id: 'be_1',
            title: 'Auth & Session Tokens',
            parentId: 'be',
            x: 600,
            y: 80,
            color: 'emerald',
            createdAt: now,
            updatedAt: now,
          },
          be_2: {
            id: 'be_2',
            title: 'Data Ingestion & PubSub',
            parentId: 'be',
            x: 600,
            y: 160,
            color: 'emerald',
            createdAt: now,
            updatedAt: now,
          },
          data: {
            id: 'data',
            title: 'Persistence Engine',
            parentId: 'root',
            x: -300,
            y: 0,
            color: 'amber',
            icon: 'Layers',
            tags: ['database'],
            createdAt: now,
            updatedAt: now,
          },
        },
        weaves: [
          {
            id: 'w1',
            fromId: 'fe_2',
            toId: 'be_1',
            label: 'Bearer Auth handshake',
          },
        ],
      };
    } else if (type === 'roadmap') {
      templateData = {
        id: `loomind-${now}`,
        title: 'Product Roadmap & Vision',
        rootId: 'root',
        createdAt: now,
        updatedAt: now,
        nodes: {
          root: {
            id: 'root',
            title: 'Product 2026 Vision',
            parentId: null,
            x: 0,
            y: 0,
            color: 'violet',
            icon: 'Target',
            createdAt: now,
            updatedAt: now,
          },
          q1: {
            id: 'q1',
            title: 'Phase 1: Core Foundation',
            parentId: 'root',
            x: 280,
            y: -120,
            color: 'emerald',
            icon: 'CheckCircle2',
            status: 'completed',
            createdAt: now,
            updatedAt: now,
          },
          q2: {
            id: 'q2',
            title: 'Phase 2: Collaboration & Scale',
            parentId: 'root',
            x: 280,
            y: 120,
            color: 'indigo',
            icon: 'Zap',
            status: 'in-progress',
            createdAt: now,
            updatedAt: now,
          },
          q3: {
            id: 'q3',
            title: 'Phase 3: Intelligence & Automation',
            parentId: 'root',
            x: -280,
            y: 0,
            color: 'amber',
            icon: 'Sparkles',
            status: 'idea',
            createdAt: now,
            updatedAt: now,
          },
        },
        weaves: [
          {
            id: 'w1',
            fromId: 'q1',
            toId: 'q2',
            label: 'prerequisite for',
          },
        ],
      };
    } else {
      // Default Ideation
      templateData = {
        id: `loomind-${now}`,
        title: 'Creative Ideation Loom',
        rootId: 'root',
        createdAt: now,
        updatedAt: now,
        nodes: {
          root: {
            id: 'root',
            title: 'Next Big Breakthrough',
            parentId: null,
            x: 0,
            y: 0,
            color: 'indigo',
            icon: 'Lightbulb',
            createdAt: now,
            updatedAt: now,
          },
          pain: {
            id: 'pain',
            title: 'User Frustrations & Pains',
            parentId: 'root',
            x: -280,
            y: -80,
            color: 'rose',
            icon: 'HelpCircle',
            createdAt: now,
            updatedAt: now,
          },
          sol: {
            id: 'sol',
            title: 'Radical Solution Hypotheses',
            parentId: 'root',
            x: 280,
            y: -80,
            color: 'emerald',
            icon: 'Sparkles',
            createdAt: now,
            updatedAt: now,
          },
          edge: {
            id: 'edge',
            title: 'Unfair Competitive Advantage',
            parentId: 'root',
            x: 280,
            y: 100,
            color: 'amber',
            icon: 'Flame',
            createdAt: now,
            updatedAt: now,
          },
        },
        weaves: [
          {
            id: 'w1',
            fromId: 'pain',
            toId: 'sol',
            label: 'addressed directly by',
          },
        ],
      };
    }

    onSelectTemplate(templateData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Choose Starter Template</h2>
            <p className="text-xs text-slate-500">
              Initialize your thought canvas with a structured starter layout.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => handleTemplateClick('ideation')}
            className="p-4 text-left rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-slate-900 mb-1">Creative Ideation</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Unpack customer problems, brainstorm radical solutions, and weave competitive advantages.
            </p>
          </button>

          <button
            onClick={() => handleTemplateClick('architecture')}
            className="p-4 text-left rounded-xl border border-slate-200 hover:border-sky-400 hover:bg-sky-50/40 transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Server className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-slate-900 mb-1">System Architecture</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Model frontend, backend services, caching tiers, and cross-system API weaves.
            </p>
          </button>

          <button
            onClick={() => handleTemplateClick('roadmap')}
            className="p-4 text-left rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40 transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Compass className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-slate-900 mb-1">Product Roadmap</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Organize releases into iterative phases with dependency weaves and milestone tracking.
            </p>
          </button>

          <button
            onClick={() => handleTemplateClick('blank')}
            className="p-4 text-left rounded-xl border border-dashed border-slate-300 hover:border-slate-500 hover:bg-slate-50 transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Plus className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-slate-900 mb-1">Blank Canvas</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Start with a pure, empty central node and freely weave your thoughts from scratch.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};

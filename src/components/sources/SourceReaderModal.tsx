import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Search,
  FileText,
  ExternalLink,
  CheckSquare,
  Square,
  BookOpen,
} from 'lucide-react';
import { ResearchSource } from '../../types';

interface SourceReaderModalProps {
  source: ResearchSource | null;
  onClose: () => void;
  onToggleSelect: (id: string) => void;
}

export const SourceReaderModal: React.FC<SourceReaderModalProps> = ({
  source,
  onClose,
  onToggleSelect,
}) => {
  const [copied, setCopied] = useState(false);
  const [searchInDoc, setSearchInDoc] = useState('');

  if (!source) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(source.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Document text rendering with search highlight
  const renderHighlightedContent = () => {
    if (!searchInDoc.trim()) {
      return (
        <pre className="whitespace-pre-wrap font-sans text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-200">
          {source.content}
        </pre>
      );
    }

    const regex = new RegExp(`(${searchInDoc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = source.content.split(regex);

    return (
      <div className="whitespace-pre-wrap font-sans text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-200">
        {parts.map((part, i) =>
          regex.test(part) ? (
            <mark
              key={i}
              className="bg-amber-300 dark:bg-amber-500/40 text-slate-900 dark:text-amber-200 font-semibold px-0.5 rounded"
            >
              {part}
            </mark>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                Citation [{source.citationIndex}] • {source.type}
              </span>
              {source.fileSize && (
                <span className="text-xs text-slate-400 font-mono">{source.fileSize}</span>
              )}
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
              {source.title}
            </h2>
            {source.author && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {source.author} {source.publishedYear && `(${source.publishedYear})`}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleCopy}
              className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Copy document text"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search bar within document */}
        <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchInDoc}
              onChange={(e) => setSearchInDoc(e.target.value)}
              placeholder="Find in document..."
              className="w-full pl-8 pr-3 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            onClick={() => onToggleSelect(source.id)}
            className="text-xs flex items-center gap-1.5 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
          >
            {source.isSelected ? (
              <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            ) : (
              <Square className="w-4 h-4 text-slate-400" />
            )}
            <span>{source.isSelected ? 'Included in AI Context' : 'Excluded from Context'}</span>
          </button>
        </div>

        {/* Content Viewer */}
        <div className="p-6 flex-1 overflow-y-auto bg-white dark:bg-slate-900 selection:bg-indigo-100 dark:selection:bg-indigo-900">
          {renderHighlightedContent()}
        </div>

        {/* Footer Meta */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <span>{source.wordCount.toLocaleString()} words</span>
            <span>•</span>
            <span>{source.charCount.toLocaleString()} characters</span>
          </div>

          {source.originalUrl && (
            <a
              href={source.originalUrl}
              target="_blank"
              rel="noreferrer"
              className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>Original Source Link</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

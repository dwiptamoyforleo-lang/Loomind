import React, { useState } from 'react';
import { X, Copy, Check, Download, Upload, FileText, Code2 } from 'lucide-react';
import { LoomindData } from '../types';
import { exportToMarkdown } from '../utils/layout';

interface ExportModalProps {
  isOpen: boolean;
  data: LoomindData;
  onClose: () => void;
  onImportData: (imported: LoomindData) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  data,
  onClose,
  onImportData,
}) => {
  const [activeTab, setActiveTab] = useState<'markdown' | 'json' | 'import'>('markdown');
  const [copied, setCopied] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  if (!isOpen) return null;

  const markdownText = exportToMarkdown(data);
  const jsonText = JSON.stringify(data, null, 2);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportSubmit = () => {
    setImportError(null);
    try {
      const parsed = JSON.parse(importJsonText);
      if (!parsed.nodes || !parsed.rootId || !parsed.nodes[parsed.rootId]) {
        throw new Error('Invalid Loomind file format. Missing nodes or rootId.');
      }
      onImportData(parsed);
      onClose();
    } catch (err: any) {
      setImportError(err.message || 'Failed to parse JSON.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportJsonText(content);
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Export & Import Loom</h2>
            <p className="text-xs text-slate-500">
              Share or backup your thought map across formats.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50/50">
          <button
            onClick={() => setActiveTab('markdown')}
            className={`flex items-center gap-1.5 py-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'markdown'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Markdown Outline
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`flex items-center gap-1.5 py-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'json'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            JSON Backup
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`flex items-center gap-1.5 py-2.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'import'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Import Loom
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 flex-1 overflow-y-auto">
          {activeTab === 'markdown' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Hierarchical outline with notes and weaved links:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(markdownText)}
                    className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-md border border-slate-200 hover:bg-slate-50 text-slate-700"
                  >
                    {copied ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={() =>
                      handleDownload(
                        markdownText,
                        `${data.title.toLowerCase().replace(/\s+/g, '-')}.md`,
                        'text/markdown'
                      )
                    }
                    className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-xs"
                  >
                    <Download className="w-3 h-3" />
                    Download .md
                  </button>
                </div>
              </div>
              <pre className="p-3 bg-slate-900 text-slate-100 text-xs font-mono rounded-xl max-h-64 overflow-y-auto whitespace-pre-wrap">
                {markdownText}
              </pre>
            </div>
          )}

          {activeTab === 'json' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Full structure including coordinates, tags, colors, and weaves:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(jsonText)}
                    className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-md border border-slate-200 hover:bg-slate-50 text-slate-700"
                  >
                    {copied ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={() =>
                      handleDownload(
                        jsonText,
                        `${data.title.toLowerCase().replace(/\s+/g, '-')}.json`,
                        'application/json'
                      )
                    }
                    className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-xs"
                  >
                    <Download className="w-3 h-3" />
                    Download JSON
                  </button>
                </div>
              </div>
              <pre className="p-3 bg-slate-900 text-slate-100 text-xs font-mono rounded-xl max-h-64 overflow-y-auto whitespace-pre-wrap">
                {jsonText}
              </pre>
            </div>
          )}

          {activeTab === 'import' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Upload Loom JSON File
                </label>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Or Paste JSON Text
                </label>
                <textarea
                  rows={6}
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  placeholder='{"id": "...", "nodes": { ... }, "weaves": [ ... ]}'
                  className="w-full p-2.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>

              {importError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs font-medium">
                  {importError}
                </div>
              )}

              <button
                onClick={handleImportSubmit}
                disabled={!importJsonText.trim()}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs"
              >
                Load Loom Map
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

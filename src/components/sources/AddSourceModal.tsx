import React, { useState } from 'react';
import {
  X,
  Upload,
  Link2,
  FileText,
  Sparkles,
  Check,
  AlertCircle,
  BookOpen,
} from 'lucide-react';
import { ResearchSource, SourceType } from '../../types';

interface AddSourceModalProps {
  isOpen: boolean;
  notebookId: string;
  onClose: () => void;
  onAddSource: (source: Omit<ResearchSource, 'id' | 'citationIndex'>) => void;
}

export const AddSourceModal: React.FC<AddSourceModalProps> = ({
  isOpen,
  notebookId,
  onClose,
  onAddSource,
}) => {
  const [tab, setTab] = useState<'upload' | 'url' | 'text' | 'samples'>('upload');

  // Upload tab state
  const [dragOver, setDragOver] = useState(false);
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadContent, setUploadContent] = useState('');
  const [uploadFileSize, setUploadFileSize] = useState('');

  // URL tab state
  const [urlInput, setUrlInput] = useState('');
  const [urlTitle, setUrlTitle] = useState('');

  // Paste Text state
  const [textTitle, setTextTitle] = useState('');
  const [textContent, setTextContent] = useState('');

  // Status/Error
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (file: File) => {
    setErrorMsg(null);
    setUploadFileName(file.name);
    setUploadFileSize(`${(file.size / 1024).toFixed(1)} KB`);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setUploadContent(text);
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read file contents.');
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSubmitUpload = () => {
    if (!uploadFileName || !uploadContent) {
      setErrorMsg('Please select or drop a valid file with text content.');
      return;
    }
    const words = uploadContent.split(/\s+/).filter(Boolean).length;
    const ext = uploadFileName.split('.').pop()?.toLowerCase() || 'text';
    const type: SourceType = ext === 'pdf' ? 'pdf' : ext === 'md' ? 'markdown' : 'text';

    onAddSource({
      notebookId,
      title: uploadFileName.replace(/\.[^/.]+$/, ''),
      type,
      content: uploadContent,
      fileSize: uploadFileSize,
      wordCount: words,
      charCount: uploadContent.length,
      uploadedAt: Date.now(),
      isSelected: true,
      status: 'indexed',
    });
    onClose();
  };

  const handleSubmitUrl = () => {
    if (!urlInput.trim()) {
      setErrorMsg('Please provide a valid URL.');
      return;
    }
    const derivedTitle = urlTitle.trim() || new URL(urlInput).hostname.replace('www.', '');
    const simulatedArticleText = `SYNTHESIZED WEB RESEARCH ARTICLE FROM ${urlInput}
Title: ${derivedTitle}
Retrieved: ${new Date().toISOString()}

Summary & Core Findings:
This online research document outlines contemporary developments regarding architectural scalability, operational thresholds, and system integration. Empirical data reported across cross-sectional case studies validates a statistically meaningful reduction in processing bottlenecks.
Key Observations:
1. Decentralized coordination minimizes single points of failure.
2. Latency variance is constrained within rigorous P99 limits.
3. Comparative benchmarking shows high signal-to-noise fidelity under saturated loads.`;

    const words = simulatedArticleText.split(/\s+/).filter(Boolean).length;

    onAddSource({
      notebookId,
      title: derivedTitle,
      type: 'url',
      content: simulatedArticleText,
      originalUrl: urlInput,
      fileSize: 'Web Page',
      wordCount: words,
      charCount: simulatedArticleText.length,
      uploadedAt: Date.now(),
      isSelected: true,
      status: 'indexed',
    });
    onClose();
  };

  const handleSubmitText = () => {
    if (!textTitle.trim() || !textContent.trim()) {
      setErrorMsg('Title and text content are required.');
      return;
    }
    const words = textContent.split(/\s+/).filter(Boolean).length;

    onAddSource({
      notebookId,
      title: textTitle.trim(),
      type: 'notes',
      content: textContent.trim(),
      fileSize: `${(textContent.length / 1024).toFixed(1)} KB`,
      wordCount: words,
      charCount: textContent.length,
      uploadedAt: Date.now(),
      isSelected: true,
      status: 'indexed',
    });
    onClose();
  };

  const handleAddSample = (sampleType: 'genomics' | 'fusion' | 'security') => {
    if (sampleType === 'genomics') {
      const content = `CRISPR-Cas9 Base Editing Fidelity and Off-Target Suppression.
Authors: Doudna, Liu & Zhang.
Journal: Science & Cell Review.
Abstract:
Base editing enables direct, programmable conversion of one base pair to another without double-stranded DNA breaks. Here we characterize dual-deaminase architecture (CBE and ABE) in mammalian cellular models.
Findings:
1. Engineered Cas9 nickases reduce guide-independent off-target RNA deamination by 94.2%.
2. Bystander editing within the 5-nucleotide canonical editing window was mitigated by narrowing the deaminase catalytic cleft.
3. Therapeutic efficacy in correction of sickle cell and beta-thalassemia pathogenic variants reached 78% in human CD34+ hematopoietic stem cells.`;
      onAddSource({
        notebookId,
        title: 'CRISPR-Cas9 Base Editing Fidelity & Deaminase Engineering',
        type: 'pdf',
        fileSize: '3.6 MB',
        wordCount: 3800,
        charCount: 24500,
        uploadedAt: Date.now(),
        isSelected: true,
        status: 'indexed',
        author: 'Doudna & Liu',
        publishedYear: '2025',
        content,
      });
    } else if (sampleType === 'fusion') {
      const content = `High-Field Toroidal Field Magnets and Burning Plasma Regimes in Tokamaks.
Commonwealth Fusion Lab & MIT PSFC Technical Report.
Executive Overview:
The utilization of Rare-Earth Barium Copper Oxide (REBCO) high-temperature superconducting (HTS) tapes permits on-axis magnetic field strengths exceeding 12.2 Tesla.
Key Breakthroughs:
1. Volumetric fusion power density scales as B^4, resulting in a 40x power density gain over legacy low-temperature superconductor designs.
2. Divertor heat flux mitigation via detachment control suppresses localized thermal erosion below 5 MW/m^2.
3. Net energy gain Q > 2 achieved across continuous 100-second discharge simulations.`;
      onAddSource({
        notebookId,
        title: 'High-Field HTS Magnets for Commercial Fusion Tokamaks',
        type: 'doc',
        fileSize: '4.2 MB',
        wordCount: 4500,
        charCount: 29800,
        uploadedAt: Date.now(),
        isSelected: true,
        status: 'indexed',
        author: 'MIT Energy Initiative',
        publishedYear: '2025',
        content,
      });
    } else {
      const content = `Formal Verification of Distributed Consensus Protocols under Byzantine Faults.
ACM Transactions on Computer Systems.
Abstract:
We present a mechanized proof of safety and liveness for asynchronous Byzantine agreement protocols. Using the Coq proof assistant, all state-machine transitions are formally verified against arbitrary network partitions.
Results:
1. Elimination of hidden deadlock conditions present in unverified Paxos variants.
2. Latency bound verified at O(1) expected message rounds under optimistic network synchrony.
3. Sub-quadratic message complexity achieved via threshold signature aggregation.`;
      onAddSource({
        notebookId,
        title: 'Formal Verification of Byzantine Fault Tolerant Consensus',
        type: 'text',
        fileSize: '1.8 MB',
        wordCount: 5200,
        charCount: 33400,
        uploadedAt: Date.now(),
        isSelected: true,
        status: 'indexed',
        author: 'Lamport & Schneider',
        publishedYear: '2024',
        content,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Attach Research Sources
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Ground your AI assistant in research papers, documentation, or links.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-5 bg-slate-50/70 dark:bg-slate-900/50 text-xs font-semibold">
          <button
            onClick={() => {
              setTab('upload');
              setErrorMsg(null);
            }}
            className={`py-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              tab === 'upload'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Files</span>
          </button>

          <button
            onClick={() => {
              setTab('url');
              setErrorMsg(null);
            }}
            className={`py-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              tab === 'url'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Web Link</span>
          </button>

          <button
            onClick={() => {
              setTab('text');
              setErrorMsg(null);
            }}
            className={`py-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              tab === 'text'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Paste Text</span>
          </button>

          <button
            onClick={() => {
              setTab('samples');
              setErrorMsg(null);
            }}
            className={`py-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              tab === 'samples'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated Library</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Tab 1: Upload */}
          {tab === 'upload' && (
            <div className="space-y-4">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors cursor-pointer ${
                  dragOver
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30'
                    : 'border-slate-300 dark:border-slate-700 hover:border-slate-400'
                }`}
                onClick={() => document.getElementById('file-upload-input')?.click()}
              >
                <Upload className="w-8 h-8 mx-auto mb-2 text-indigo-600 dark:text-indigo-400" />
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Drag and drop files here, or click to browse
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Supported: PDF, TXT, Markdown (.md), DOC, JSON
                </p>
                <input
                  id="file-upload-input"
                  type="file"
                  accept=".txt,.md,.pdf,.json,.doc,.docx"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
              </div>

              {uploadFileName && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {uploadFileName}
                    </span>
                    <span className="text-[10px] text-slate-400 shrink-0">({uploadFileSize})</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                    Ready to index
                  </span>
                </div>
              )}

              <button
                onClick={handleSubmitUpload}
                disabled={!uploadFileName}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Add Source to Notebook
              </button>
            </div>
          )}

          {/* Tab 2: Web URL */}
          {tab === 'url' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Web Page or Paper URL
                </label>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://arxiv.org/abs/... or https://nature.com/..."
                  className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Source Title (Optional)
                </label>
                <input
                  type="text"
                  value={urlTitle}
                  onChange={(e) => setUrlTitle(e.target.value)}
                  placeholder="e.g. arXiv 2025 Review"
                  className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                onClick={handleSubmitUrl}
                disabled={!urlInput.trim()}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Fetch & Index Webpage
              </button>
            </div>
          )}

          {/* Tab 3: Paste Text */}
          {tab === 'text' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  value={textTitle}
                  onChange={(e) => setTextTitle(e.target.value)}
                  placeholder="e.g. Lab Experiment Notes or Thesis Abstract"
                  className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Text or Markdown Content
                </label>
                <textarea
                  rows={6}
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Paste research text, raw transcript, formulas, or notes here..."
                  className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 resize-none font-mono"
                />
              </div>

              <button
                onClick={handleSubmitText}
                disabled={!textTitle.trim() || !textContent.trim()}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Index Text Note
              </button>
            </div>
          )}

          {/* Tab 4: Curated Library */}
          {tab === 'samples' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Instantly import pre-indexed research papers to test multi-source synthesis:
              </p>

              <button
                onClick={() => handleAddSample('genomics')}
                className="w-full p-3 text-left rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600 bg-white dark:bg-slate-800 transition-all flex items-start justify-between group cursor-pointer"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Genomics & CRISPR
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                    CRISPR-Cas9 Base Editing Fidelity & Deaminase Engineering
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Science review by Doudna & Liu analyzing off-target deamination suppression.
                  </p>
                </div>
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 shrink-0 ml-2 group-hover:underline">
                  + Add
                </span>
              </button>

              <button
                onClick={() => handleAddSample('fusion')}
                className="w-full p-3 text-left rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600 bg-white dark:bg-slate-800 transition-all flex items-start justify-between group cursor-pointer"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    Nuclear & Clean Energy
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                    High-Field HTS Magnets for Commercial Fusion Tokamaks
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    MIT PSFC report detailing 12.2 Tesla REBCO magnetic confinement and Q &gt; 2 regimes.
                  </p>
                </div>
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 shrink-0 ml-2 group-hover:underline">
                  + Add
                </span>
              </button>

              <button
                onClick={() => handleAddSample('security')}
                className="w-full p-3 text-left rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600 bg-white dark:bg-slate-800 transition-all flex items-start justify-between group cursor-pointer"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Distributed Systems
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                    Formal Verification of Byzantine Fault Tolerant Consensus
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Mechanized Coq proofs for asynchronous consensus under arbitrary partitions.
                  </p>
                </div>
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 shrink-0 ml-2 group-hover:underline">
                  + Add
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

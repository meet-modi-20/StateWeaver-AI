import React, { useState, useEffect } from 'react';
import { 
  Folder, 
  FileCode, 
  FolderOpen, 
  Upload, 
  GitBranch, 
  RefreshCw, 
  Check, 
  Cpu, 
  Code2, 
  Layers, 
  AlertCircle,
  FileText,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { fetchRepositoryFiles, fetchFileContent } from '../services/api';

export default function RepositoryWorkspaceView({ selectedRepo, onSelectRepo, onNavigate }) {
  const [fileTree, setFileTree] = useState(null);
  const [selectedFile, setSelectedFile] = useState('models.py');
  const [fileContent, setFileContent] = useState('');
  const [loadingFile, setLoadingFile] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState({ '.': true, 'tests': true, 'solution': false });
  const [gitUrl, setGitUrl] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    loadFiles();
  }, [selectedRepo]);

  useEffect(() => {
    if (selectedFile) {
      loadFile(selectedFile);
    }
  }, [selectedFile, selectedRepo]);

  const loadFiles = async () => {
    try {
      const data = await fetchRepositoryFiles(selectedRepo);
      setFileTree(data);
    } catch (err) {
      console.error("Failed to load files", err);
    }
  };

  const loadFile = async (path) => {
    setLoadingFile(true);
    try {
      const res = await fetchFileContent(selectedRepo, path);
      setFileContent(res.content);
    } catch (err) {
      setFileContent('# Unable to load file content.');
    } finally {
      setLoadingFile(false);
    }
  };

  const toggleFolder = (path) => {
    setExpandedFolders(prev => ({ ...prev, [path]: !prev[path] }));
  };

  const renderTree = (node) => {
    if (!node) return null;
    const isDir = node.type === 'directory';
    const isExpanded = expandedFolders[node.path];
    const isSelected = selectedFile === node.path;

    if (isDir) {
      return (
        <div key={node.path} className="text-xs">
          <div 
            onClick={() => toggleFolder(node.path)}
            className="flex items-center gap-1.5 py-1 px-2 rounded hover:bg-cream-200 cursor-pointer text-charcoal-700 font-medium select-none"
          >
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-charcoal-400" /> : <ChevronRight className="w-3.5 h-3.5 text-charcoal-400" />}
            {isExpanded ? <FolderOpen className="w-4 h-4 text-lavender-500" /> : <Folder className="w-4 h-4 text-lavender-400" />}
            <span>{node.name}</span>
          </div>
          {isExpanded && node.children && (
            <div className="pl-4 border-l border-cream-200 ml-3 mt-0.5 space-y-0.5">
              {node.children.map(child => renderTree(child))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div 
        key={node.path}
        onClick={() => setSelectedFile(node.path)}
        className={`flex items-center gap-2 py-1 px-2 rounded cursor-pointer text-xs transition-colors ${
          isSelected 
            ? 'bg-lavender-100 text-lavender-800 font-semibold border-l-2 border-lavender-600' 
            : 'text-charcoal-600 hover:bg-cream-200 hover:text-charcoal-900'
        }`}
      >
        <FileCode className={`w-3.5 h-3.5 ${isSelected ? 'text-lavender-600' : 'text-charcoal-400'}`} />
        <span className="truncate">{node.name}</span>
        {node.size > 0 && (
          <span className="text-[10px] text-charcoal-400 ml-auto font-mono">
            {(node.size / 1024).toFixed(1)}k
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 paper-surface rounded-xl p-4 border border-cream-300">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-lavender-100 border border-lavender-200 text-lavender-700">
            <GitBranch className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-charcoal-900 text-base">{selectedRepo}</h2>
              <span className="text-[11px] px-2 py-0.5 rounded bg-cream-200 text-charcoal-600 font-mono">
                commit: c7d24a1
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-mint-100 text-mint-700 font-medium border border-mint-200">
                AST Parsed
              </span>
            </div>
            <p className="text-xs text-charcoal-500 mt-0.5">
              Domain-Driven Order Fulfillment Service with Stateful Lifecycle Engine
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <select
            value={selectedRepo}
            onChange={(e) => onSelectRepo(e.target.value)}
            className="text-xs rounded-lg border border-cream-300 bg-white px-3 py-1.5 text-charcoal-700 focus:outline-none focus:ring-2 focus:ring-lavender-500 font-medium"
          >
            <option value="order-fulfillment-engine">order-fulfillment-engine (Primary Python Demo)</option>
            <option value="fintech-ledger-core">fintech-ledger-core (Accounting Python Demo)</option>
          </select>
          <button
            onClick={() => onNavigate('intelligence')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-lavender-600 text-white hover:bg-lavender-700 transition-colors"
          >
            <Cpu className="w-3.5 h-3.5" />
            View Behaviour Graph
          </button>
        </div>
      </div>

      {/* Main Workspace: File Browser + Code Viewer + Analysis Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Repository Files Tree (3 cols) */}
        <div className="lg:col-span-3 paper-surface rounded-xl p-4 border border-cream-300 min-h-[580px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-cream-200">
              <span className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">Repository Files</span>
              <button onClick={loadFiles} className="text-charcoal-400 hover:text-charcoal-600">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-1">
              {fileTree ? renderTree(fileTree) : (
                <div className="text-xs text-charcoal-400 py-4 text-center">Loading file tree...</div>
              )}
            </div>
          </div>

          {/* Upload or Git Ingest Box */}
          <div className="pt-4 border-t border-cream-200 mt-6 space-y-2">
            <span className="text-[11px] font-semibold text-charcoal-500 uppercase tracking-wider">Ingest Custom Codebase</span>
            <div className="relative">
              <input
                type="text"
                placeholder="https://github.com/org/repo.git"
                value={gitUrl}
                onChange={(e) => setGitUrl(e.target.value)}
                className="w-full text-xs rounded-lg border border-cream-300 bg-cream-50 px-2.5 py-1.5 text-charcoal-700 focus:outline-none focus:ring-1 focus:ring-lavender-500"
              />
            </div>
            <button
              onClick={() => {
                if (gitUrl) {
                  setUploadSuccess(true);
                  setTimeout(() => setUploadSuccess(false), 3000);
                }
              }}
              className="w-full py-1.5 rounded-lg text-xs font-medium bg-cream-100 hover:bg-cream-200 text-charcoal-700 border border-cream-300 transition-colors flex items-center justify-center gap-1.5"
            >
              {uploadSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-mint-600" />
                  <span className="text-mint-700 font-semibold">Repository Ingested!</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5 text-charcoal-500" />
                  <span>Ingest Git / Upload ZIP</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Middle Column: Syntax Code Viewer (6 cols) */}
        <div className="lg:col-span-6 paper-surface rounded-xl overflow-hidden border border-cream-300 flex flex-col min-h-[580px]">
          {/* Code Viewer Title bar */}
          <div className="px-4 py-2.5 bg-cream-50 border-b border-cream-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-lavender-600" />
              <span className="font-mono font-semibold text-charcoal-800">{selectedFile}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-charcoal-400 font-mono">
                {fileContent.split('\n').length} lines
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-lavender-50 text-lavender-700 font-medium border border-lavender-200">
                Python 3.15
              </span>
            </div>
          </div>

          {/* Code Body */}
          <div className="flex-1 p-4 bg-charcoal-900 text-charcoal-300 font-mono text-xs overflow-auto max-h-[520px]">
            {loadingFile ? (
              <div className="text-charcoal-500 py-8 text-center">Loading file...</div>
            ) : (
              <div className="table w-full">
                {fileContent.split('\n').map((line, idx) => (
                  <div key={idx} className="table-row hover:bg-charcoal-800/50">
                    <span className="table-cell select-none pr-4 text-right text-charcoal-600 text-[11px] w-8">
                      {idx + 1}
                    </span>
                    <span className="table-cell whitespace-pre text-slate-200 font-normal">
                      {line}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Codebase Intelligence & AST Metrics (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="paper-surface rounded-xl p-4 border border-cream-300 space-y-3">
            <h3 className="text-xs font-bold text-charcoal-700 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-lavender-600" />
              AST Static Extraction
            </h3>
            
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-cream-200">
                <span className="text-charcoal-500">Framework</span>
                <span className="font-medium text-charcoal-800">Domain-Driven DDD</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-cream-200">
                <span className="text-charcoal-500">Language</span>
                <span className="font-medium text-charcoal-800">Python 3.10+</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-cream-200">
                <span className="text-charcoal-500">Enums Discovered</span>
                <span className="font-semibold text-lavender-700">OrderStatus, PaymentStatus</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-cream-200">
                <span className="text-charcoal-500">State Transitions</span>
                <span className="font-semibold text-charcoal-900">8 Transitions</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-charcoal-500">Invariants Identified</span>
                <span className="font-semibold text-mint-700">4 Conservation Laws</span>
              </div>
            </div>
          </div>

          <div className="paper-surface rounded-xl p-4 border border-cream-300 space-y-3">
            <h3 className="text-xs font-bold text-charcoal-700 uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
              Latent Vulnerabilities
            </h3>
            <p className="text-xs text-charcoal-600">
              AST discovered unhandled state branches where customer cancellation causes runtime failures:
            </p>
            <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-1">
              <span className="font-semibold block">Missing PAID Cancellation:</span>
              <p className="text-[11px] leading-relaxed">
                Line 125 of <code className="bg-amber-100 px-1 py-0.5 rounded">services.py</code> raises NotImplementedError when cancelling paid orders.
              </p>
            </div>
            <button
              onClick={() => onNavigate('generator')}
              className="w-full py-2 rounded-lg text-xs font-semibold bg-lavender-600 text-white hover:bg-lavender-700 transition-colors shadow-soft"
            >
              Synthesize Task Around This Flaw
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  GitCommit, 
  FileCode, 
  CheckCircle2, 
  ArrowRight, 
  Layers, 
  Terminal, 
  Columns, 
  AlignLeft,
  FileDiff,
  ShieldCheck
} from 'lucide-react';
import { fetchReferenceImplementation } from '../services/api';

export default function ReferenceImplementationView({ currentTask, onNavigate }) {
  const [refImpl, setRefImpl] = useState(null);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [diffMode, setDiffMode] = useState('unified'); // 'unified' | 'split'
  const [loading, setLoading] = useState(true);

  const taskId = currentTask?.id || 'TASK-SW-2026-ORDE-01';

  useEffect(() => {
    loadReferenceImpl();
  }, [taskId]);

  const loadReferenceImpl = async () => {
    setLoading(true);
    try {
      const data = await fetchReferenceImplementation(taskId);
      setRefImpl(data);
    } catch (err) {
      console.error("Failed to load reference implementation", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="paper-surface rounded-xl p-12 text-center text-charcoal-400">
        Loading reference implementation diffs...
      </div>
    );
  }

  const activeChange = refImpl?.changes?.[activeFileIndex] || refImpl?.changes?.[0];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="paper-surface rounded-xl p-5 border border-cream-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-lavender-100 text-lavender-700 border border-lavender-200">
              Reference Solution Patch
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-mint-50 text-mint-700 font-semibold border border-mint-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              {refImpl?.status || 'VERIFIED'}
            </span>
          </div>
          <h2 className="text-xl font-bold text-charcoal-900 mt-1">Ground-Truth Reference Implementation</h2>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Verified human-level code modifications resolving state graph, financial refund orchestration, and inventory rollback.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right text-xs hidden sm:block">
            <div className="font-mono text-charcoal-500">
              base: <span className="text-charcoal-800 font-bold">{refImpl?.base_commit}</span> → head: <span className="text-lavender-700 font-bold">{refImpl?.solution_commit}</span>
            </div>
            <div className="text-[11px] text-charcoal-400">{refImpl?.branch}</div>
          </div>
          <button
            onClick={() => onNavigate('testing')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-lavender-600 text-white hover:bg-lavender-700 transition-colors shadow-soft"
          >
            <Terminal className="w-3.5 h-3.5" />
            Validate in Testing Lab
            <ArrowRight className="w-3 h-3 ml-1" />
          </button>
        </div>
      </div>

      {/* Main Diff Explorer Area */}
      <div className="paper-surface rounded-xl overflow-hidden border border-cream-300">
        {/* Diff Toolbar & File Selector */}
        <div className="bg-cream-50 px-4 py-3 border-b border-cream-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          {/* File Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto">
            {refImpl?.changes?.map((ch, idx) => (
              <button
                key={ch.file_path}
                onClick={() => setActiveFileIndex(idx)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-xs transition-colors whitespace-nowrap ${
                  activeFileIndex === idx
                    ? 'bg-white text-charcoal-900 font-semibold shadow-soft border border-cream-300'
                    : 'text-charcoal-500 hover:text-charcoal-800 hover:bg-cream-200'
                }`}
              >
                <FileCode className="w-3.5 h-3.5 text-lavender-600" />
                <span>{ch.file_path}</span>
                <span className="text-[10px] text-mint-600 font-bold">+{ch.additions}</span>
                <span className="text-[10px] text-red-500 font-bold">-{ch.deletions}</span>
              </button>
            ))}
          </div>

          {/* View Mode Toggle: Unified vs Side-by-Side */}
          <div className="flex items-center gap-2 self-end sm:self-center">
            <div className="flex bg-cream-200 p-0.5 rounded-lg border border-cream-300">
              <button
                onClick={() => setDiffMode('unified')}
                className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 ${
                  diffMode === 'unified' ? 'bg-white text-charcoal-900 shadow-sm' : 'text-charcoal-500'
                }`}
              >
                <AlignLeft className="w-3 h-3" />
                Unified Diff
              </button>
              <button
                onClick={() => setDiffMode('split')}
                className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 ${
                  diffMode === 'split' ? 'bg-white text-charcoal-900 shadow-sm' : 'text-charcoal-500'
                }`}
              >
                <Columns className="w-3 h-3" />
                Side-by-Side
              </button>
            </div>
          </div>
        </div>

        {/* Change Explanation Card */}
        {activeChange && (
          <div className="bg-lavender-50/50 p-4 border-b border-cream-200 text-xs">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-lavender-600 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-charcoal-900 font-semibold">Architectural Rationale:</strong>
                <span className="text-charcoal-700 ml-1.5 leading-relaxed">{activeChange.explanation}</span>
              </div>
            </div>
          </div>
        )}

        {/* Diff Display View */}
        {diffMode === 'unified' ? (
          /* Unified Diff View */
          <div className="p-4 bg-charcoal-900 text-charcoal-300 font-mono text-xs overflow-auto max-h-[500px]">
            {activeChange?.unified_diff ? (
              activeChange.unified_diff.split('\n').map((line, idx) => {
                let lineClass = 'text-charcoal-300';
                let bgClass = '';
                if (line.startsWith('+') && !line.startsWith('+++')) {
                  lineClass = 'text-mint-400 font-medium';
                  bgClass = 'bg-mint-950/40';
                } else if (line.startsWith('-') && !line.startsWith('---')) {
                  lineClass = 'text-red-400 font-medium';
                  bgClass = 'bg-red-950/40';
                } else if (line.startsWith('@@')) {
                  lineClass = 'text-lavender-400 font-semibold';
                  bgClass = 'bg-lavender-950/30';
                }

                return (
                  <div key={idx} className={`px-2 py-0.5 ${bgClass} hover:bg-charcoal-800/60`}>
                    <span className={lineClass}>{line || ' '}</span>
                  </div>
                );
              })
            ) : (
              <div className="text-charcoal-500 py-6 text-center">No diff available for this file.</div>
            )}
          </div>
        ) : (
          /* Side-by-Side Split View */
          <div className="grid grid-cols-2 divide-x divide-charcoal-800 bg-charcoal-900 text-charcoal-300 font-mono text-xs overflow-auto max-h-[500px]">
            {/* Left: Original Code */}
            <div className="p-4">
              <div className="text-[11px] text-red-400 font-bold uppercase pb-2 mb-2 border-b border-charcoal-800">
                Baseline (Commit {refImpl?.base_commit})
              </div>
              <pre className="whitespace-pre overflow-x-auto text-charcoal-400">
                {activeChange?.original_code || '// None'}
              </pre>
            </div>
            {/* Right: Patched Code */}
            <div className="p-4 bg-charcoal-950/40">
              <div className="text-[11px] text-mint-400 font-bold uppercase pb-2 mb-2 border-b border-charcoal-800">
                Patched Reference Solution (Commit {refImpl?.solution_commit})
              </div>
              <pre className="whitespace-pre overflow-x-auto text-slate-200">
                {activeChange?.patched_code || '// None'}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Summary Footer */}
      <div className="paper-surface rounded-xl p-5 border border-cream-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-xs font-bold text-charcoal-800 uppercase tracking-wider">Solution Verification Summary</h4>
          <p className="text-xs text-charcoal-600 mt-1">
            {refImpl?.summary_of_changes}
          </p>
        </div>
        <button
          onClick={() => onNavigate('testing')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-lavender-600 hover:bg-lavender-700 shadow-sm transition-all whitespace-nowrap self-start sm:self-center"
        >
          <span>Run Test Suite Against This Implementation</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

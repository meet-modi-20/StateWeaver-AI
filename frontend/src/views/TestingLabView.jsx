import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Terminal, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Clock, 
  RotateCcw, 
  ShieldCheck, 
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers
} from 'lucide-react';
import { runTestsApi } from '../services/api';

export default function TestingLabView({ currentTask, onNavigate }) {
  const [mode, setMode] = useState('reference_implementation'); // 'baseline' | 'reference_implementation'
  const [running, setRunning] = useState(false);
  const [testRun, setTestRun] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedErrors, setExpandedErrors] = useState({});

  const taskId = currentTask?.id || 'TASK-SW-2026-ORDE-01';

  useEffect(() => {
    executeTests(mode);
  }, [mode]);

  const executeTests = async (targetMode) => {
    setRunning(true);
    try {
      const result = await runTestsApi(taskId, targetMode);
      setTestRun(result);
    } catch (err) {
      console.error("Test execution failed", err);
    } finally {
      setRunning(false);
    }
  };

  const toggleError = (index) => {
    setExpandedErrors(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const categories = [
    { id: 'all', label: 'All Tests' },
    { id: 'functional', label: 'Functional Business Logic' },
    { id: 'edge_case', label: 'Edge-Case & Boundaries' },
    { id: 'invariant', label: 'Business Invariants' },
    { id: 'regression', label: 'Regression Protection' }
  ];

  const filteredResults = testRun?.results?.filter(r => {
    if (selectedCategory === 'all') return true;
    return r.category === selectedCategory;
  }) || [];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="paper-surface rounded-xl p-5 border border-cream-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-lavender-100 text-lavender-700 border border-lavender-200">
              Interactive Test Harness
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-cream-200 text-charcoal-700 font-mono">
              python unittest / pytest
            </span>
          </div>
          <h2 className="text-xl font-bold text-charcoal-900 mt-1">Four-Tier Multi-Category Testing Lab</h2>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Real test runner executing against isolated subprocesses. Honest pass, fail, and invariant error feedback.
          </p>
        </div>

        {/* Mode Selector and Run Button */}
        <div className="flex items-center gap-3">
          <div className="flex bg-cream-200 p-1 rounded-lg border border-cream-300">
            <button
              onClick={() => setMode('baseline')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                mode === 'baseline' ? 'bg-white text-charcoal-900 shadow-soft' : 'text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              Test Baseline Code
            </button>
            <button
              onClick={() => setMode('reference_implementation')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                mode === 'reference_implementation' ? 'bg-white text-lavender-700 shadow-soft' : 'text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              Test Reference Solution
            </button>
          </div>

          <button
            onClick={() => executeTests(mode)}
            disabled={running}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-lavender-600 text-white hover:bg-lavender-700 disabled:opacity-50 transition-colors shadow-soft"
          >
            {running ? (
              <>
                <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                <span>Running Suite...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Tests</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Test Execution Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="paper-surface rounded-xl p-4 border border-cream-300">
          <span className="text-xs font-medium text-charcoal-500 block mb-1">Execution Mode</span>
          <span className={`text-sm font-bold block ${mode === 'baseline' ? 'text-amber-700' : 'text-lavender-700'}`}>
            {mode === 'baseline' ? 'Baseline Code (c7d24a1)' : 'Reference Solution (f891b42)'}
          </span>
          <span className="text-[10px] text-charcoal-400 mt-1 block">
            {mode === 'baseline' ? 'Highlights Fail-to-Pass targets' : 'Validates 100% solution success'}
          </span>
        </div>

        <div className="paper-surface rounded-xl p-4 border border-cream-300">
          <span className="text-xs font-medium text-charcoal-500 block mb-1">Total Tests</span>
          <div className="text-2xl font-bold text-charcoal-900">{testRun?.total_tests ?? 0}</div>
          <span className="text-[10px] text-charcoal-400 mt-1 block">
            Across 4 invariant categories
          </span>
        </div>

        <div className="paper-surface rounded-xl p-4 border border-cream-300">
          <span className="text-xs font-medium text-charcoal-500 block mb-1">Passed Tests</span>
          <div className="text-2xl font-bold text-mint-600">{testRun?.passed_tests ?? 0}</div>
          <span className="text-[10px] text-charcoal-400 mt-1 block">
            {testRun ? `${((testRun.passed_tests / testRun.total_tests) * 100).toFixed(0)}% pass rate` : ''}
          </span>
        </div>

        <div className="paper-surface rounded-xl p-4 border border-cream-300">
          <span className="text-xs font-medium text-charcoal-500 block mb-1">Failed / Unhandled</span>
          <div className={`text-2xl font-bold ${testRun?.failed_tests > 0 ? 'text-red-600' : 'text-charcoal-400'}`}>
            {testRun?.failed_tests ?? 0}
          </div>
          <span className="text-[10px] text-charcoal-400 mt-1 block">
            {testRun?.failed_tests > 0 ? 'Expected baseline gaps' : 'Zero failures detected'}
          </span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              selectedCategory === c.id
                ? 'bg-charcoal-800 text-white shadow-soft'
                : 'bg-white text-charcoal-600 border border-cream-300 hover:bg-cream-100'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Main Grid: Test Cases List (7 cols) + Terminal Output (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Test Cases Table / Cards (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          {filteredResults.map((t, idx) => {
            const isPass = t.status === 'passed';
            const isExpanded = expandedErrors[idx];

            return (
              <div 
                key={idx}
                className={`paper-surface rounded-xl p-4 border transition-all ${
                  isPass ? 'border-cream-300 bg-white' : 'border-red-200 bg-red-50/20'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    {isPass ? (
                      <CheckCircle2 className="w-4 h-4 text-mint-600 mt-0.5 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-charcoal-900">{t.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-semibold ${
                          isPass ? 'bg-mint-100 text-mint-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {t.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-charcoal-400 mt-1">
                        <span className="capitalize">{t.category.replace('_', ' ')}</span>
                        <span>•</span>
                        <span>{t.duration_ms}ms</span>
                      </div>
                    </div>
                  </div>

                  {!isPass && t.message && (
                    <button
                      onClick={() => toggleError(idx)}
                      className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                    >
                      <span>{isExpanded ? 'Hide Trace' : 'View Trace'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>

                {/* Error Traceback accordion */}
                {!isPass && isExpanded && t.message && (
                  <div className="mt-3 p-3 rounded-lg bg-charcoal-900 text-red-300 font-mono text-[11px] leading-relaxed overflow-x-auto">
                    {t.stack_trace || t.message}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Terminal Raw Stdout (5 cols) */}
        <div className="lg:col-span-5 paper-surface rounded-xl overflow-hidden border border-cream-300 flex flex-col">
          <div className="px-4 py-2.5 bg-cream-50 border-b border-cream-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-charcoal-600" />
              <span className="font-mono font-semibold text-charcoal-700">Subprocess Runner stdout</span>
            </div>
            <span className="text-[10px] text-charcoal-400 font-mono">exit code: {testRun?.failed_tests > 0 ? 1 : 0}</span>
          </div>

          <div className="p-4 bg-charcoal-900 text-charcoal-300 font-mono text-xs overflow-auto max-h-[500px] leading-relaxed">
            <pre className="whitespace-pre-wrap">{testRun?.stdout_log || '// Running test runner...'}</pre>
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="paper-surface rounded-xl p-5 border border-cream-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-xs font-bold text-charcoal-800 uppercase tracking-wider">Test Suite Readiness</h4>
          <p className="text-xs text-charcoal-600 mt-0.5">
            Target benchmark exhibits genuine <strong>Fail-to-Pass</strong> behavior (fails on baseline, 100% passes on reference solution).
          </p>
        </div>
        <button
          onClick={() => onNavigate('validation')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-lavender-600 hover:bg-lavender-700 shadow-sm transition-all whitespace-nowrap self-start sm:self-center"
        >
          <span>Audit in Validation Centre</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

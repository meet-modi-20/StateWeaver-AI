import React, { useState } from 'react';
import { 
  Sparkles, 
  Layers, 
  Sliders, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  RefreshCw,
  FileText,
  AlertOctagon,
  Copy,
  Check
} from 'lucide-react';
import { generateTaskApi } from '../services/api';

export default function TaskGeneratorView({ 
  selectedRepo, 
  currentTask, 
  setCurrentTask, 
  onNavigate 
}) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [config, setConfig] = useState({
    repository_id: selectedRepo || 'order-fulfillment-engine',
    feature_category: 'State Transition & Invariant Handling',
    difficulty: 'Senior',
    business_complexity: 4,
    variation_count: 5,
    edge_case_depth: 'Exhaustive'
  });

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const task = await generateTaskApi({
        ...config,
        repository_id: selectedRepo
      });
      setCurrentTask(task);
    } catch (err) {
      console.error("Task generation error", err);
    } finally {
      setLoading(false);
    }
  };

  const copyProblem = () => {
    if (currentTask) {
      navigator.clipboard.writeText(currentTask.problem_statement);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* View Header */}
      <div className="paper-surface rounded-xl p-5 border border-cream-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-lavender-100 text-lavender-700 border border-lavender-200">
              Task Factory
            </span>
            <h2 className="text-xl font-bold text-charcoal-900">Intelligent Challenge Synthesizer</h2>
          </div>
          <p className="text-xs text-charcoal-500 mt-1">
            Generate realistic behavioural coding challenges tailored to repository business invariants and edge cases.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {currentTask && (
            <button
              onClick={() => onNavigate('reference')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-lavender-600 text-white hover:bg-lavender-700 transition-colors shadow-soft"
            >
              <Layers className="w-3.5 h-3.5" />
              View Reference Implementation
              <ArrowRight className="w-3 h-3 ml-1" />
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Config (4 cols) + Task Preview (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Generator Configuration Form */}
        <div className="lg:col-span-4 paper-surface rounded-xl p-5 border border-cream-300 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-cream-200">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-lavender-600" />
              <h3 className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">Parameters</h3>
            </div>
            <span className="text-[10px] text-charcoal-400">Innodata Format</span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Category */}
            <div>
              <label className="font-semibold text-charcoal-700 block mb-1">Feature Category</label>
              <select
                value={config.feature_category}
                onChange={(e) => setConfig({ ...config, feature_category: e.target.value })}
                className="w-full rounded-lg border border-cream-300 bg-white px-3 py-2 text-charcoal-800 focus:outline-none focus:ring-2 focus:ring-lavender-500"
              >
                <option value="State Transition & Invariant Handling">State Transition & Invariant Handling</option>
                <option value="Double-Entry Balance & Reversals">Double-Entry Balance & Reversals</option>
                <option value="Distributed Lock & Stock Reservation">Distributed Lock & Stock Reservation</option>
                <option value="Payment Gateway Webhook Compensation">Payment Gateway Webhook Compensation</option>
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="font-semibold text-charcoal-700 block mb-1">Target Difficulty</label>
              <div className="grid grid-cols-4 gap-1.5">
                {['Junior', 'Mid', 'Senior', 'Principal'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setConfig({ ...config, difficulty: lvl })}
                    className={`py-1.5 text-center rounded-lg border font-semibold text-[11px] transition-all ${
                      config.difficulty === lvl
                        ? 'bg-lavender-600 text-white border-lavender-700 shadow-sm'
                        : 'bg-white text-charcoal-600 border-cream-300 hover:bg-cream-100'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Business Complexity Slider */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-charcoal-700">Business-Rule Complexity</label>
                <span className="font-mono text-lavender-700 font-bold">Tier {config.business_complexity} / 5</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={config.business_complexity}
                onChange={(e) => setConfig({ ...config, business_complexity: parseInt(e.target.value) })}
                className="w-full accent-lavender-600"
              />
              <span className="text-[10px] text-charcoal-400 block mt-0.5">
                Multi-entity state synchronization with financial refunds & inventory rollback.
              </span>
            </div>

            {/* Variations Count */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-charcoal-700">Behavioural Variations</label>
                <span className="font-mono text-charcoal-700 font-bold">{config.variation_count} scenarios</span>
              </div>
              <input
                type="range"
                min="2"
                max="8"
                value={config.variation_count}
                onChange={(e) => setConfig({ ...config, variation_count: parseInt(e.target.value) })}
                className="w-full accent-lavender-600"
              />
            </div>

            {/* Edge-Case Depth */}
            <div>
              <label className="font-semibold text-charcoal-700 block mb-1">Edge-Case Coverage</label>
              <div className="grid grid-cols-3 gap-1.5">
                {['Standard', 'Deep', 'Exhaustive'].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setConfig({ ...config, edge_case_depth: d })}
                    className={`py-1.5 text-center rounded-lg border font-semibold text-[11px] transition-all ${
                      config.edge_case_depth === d
                        ? 'bg-charcoal-800 text-white border-charcoal-900 shadow-sm'
                        : 'bg-white text-charcoal-600 border-cream-300 hover:bg-cream-100'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-2.5 rounded-xl font-semibold text-xs text-white bg-lavender-600 hover:bg-lavender-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-sm transform hover:-translate-y-0.5"
          >
            {loading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Synthesizing Challenge & Invariants...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Intelligent Challenge</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Generated Task Preview */}
        <div className="lg:col-span-8 paper-surface rounded-xl p-6 border border-cream-300 min-h-[580px] space-y-6">
          {currentTask ? (
            <div className="space-y-6">
              {/* Task Title & Badges */}
              <div className="space-y-2 pb-4 border-b border-cream-200">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-cream-200 text-charcoal-700 font-semibold">
                    {currentTask.id}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded font-semibold bg-lavender-100 text-lavender-700 border border-lavender-200">
                    {currentTask.difficulty}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded font-medium bg-mint-50 text-mint-700 border border-mint-200">
                    {currentTask.category}
                  </span>
                  <div className="ml-auto flex items-center gap-2">
                    <button
                      onClick={copyProblem}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium bg-cream-100 hover:bg-cream-200 text-charcoal-700 border border-cream-300 transition-colors"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-mint-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy Markdown'}</span>
                    </button>
                    <button
                      onClick={handleGenerate}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium bg-cream-100 hover:bg-cream-200 text-charcoal-700 border border-cream-300 transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Regenerate</span>
                    </button>
                  </div>
                </div>
                <h1 className="text-xl font-bold text-charcoal-900 leading-snug">{currentTask.title}</h1>
                <p className="text-xs text-charcoal-500 font-medium italic">{currentTask.tagline}</p>
              </div>

              {/* Functional Requirements Checklist */}
              <div>
                <h3 className="text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-2.5">
                  Core Functional Requirements
                </h3>
                <div className="space-y-2">
                  {currentTask.functional_requirements.map((req, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-charcoal-700 bg-cream-50 p-2.5 rounded-lg border border-cream-200">
                      <CheckCircle2 className="w-4 h-4 text-mint-600 mt-0.5 flex-shrink-0" />
                      <span className="leading-relaxed">{req}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Acceptance Criteria */}
              <div>
                <h3 className="text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-2.5">
                  Acceptance Criteria (Innodata Pass Matrix)
                </h3>
                <div className="space-y-1.5">
                  {currentTask.acceptance_criteria.map((crit, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-charcoal-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-lavender-500"></span>
                      <span>{crit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Behavioural Scenarios Matrix */}
              <div>
                <h3 className="text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-2.5">
                  Discovered Evaluation Scenarios ({currentTask.scenarios.length})
                </h3>
                <div className="space-y-2.5">
                  {currentTask.scenarios.map((scn) => (
                    <div key={scn.id} className="p-3 rounded-lg border border-cream-300 bg-white hover:border-cream-400 transition-colors text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-charcoal-900">{scn.title}</span>
                        <span className="font-mono text-[10px] text-charcoal-400">{scn.id}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] bg-cream-50 p-2 rounded border border-cream-200">
                        <div>
                          <span className="text-charcoal-400 block text-[10px]">Starting State</span>
                          <span className="font-mono font-semibold text-charcoal-800">{scn.starting_state}</span>
                        </div>
                        <div>
                          <span className="text-charcoal-400 block text-[10px]">Action</span>
                          <span className="font-mono text-lavender-700 truncate block">{scn.action}</span>
                        </div>
                        <div>
                          <span className="text-charcoal-400 block text-[10px]">Expected State</span>
                          <span className="font-mono font-semibold text-mint-700">{scn.expected_state}</span>
                        </div>
                      </div>
                      <div className="text-[11px] text-charcoal-500">
                        <strong className="text-charcoal-700">Boundary Condition:</strong> {scn.boundary_condition}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Action Button */}
              <div className="pt-4 border-t border-cream-200 flex justify-end">
                <button
                  onClick={() => onNavigate('reference')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-lavender-600 hover:bg-lavender-700 shadow-sm transition-all"
                >
                  Proceed to Reference Implementation
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center space-y-3">
              <Sparkles className="w-8 h-8 text-lavender-400 mx-auto" />
              <h3 className="text-base font-bold text-charcoal-800">No Task Generated Yet</h3>
              <p className="text-xs text-charcoal-500 max-w-sm mx-auto">
                Configure parameters on the left and click "Generate Intelligent Challenge" to synthesize a complete behavioural benchmark task.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

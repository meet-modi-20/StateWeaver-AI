import React, { useState, useEffect } from 'react';
import { 
  Workflow, 
  ShieldAlert, 
  Sparkles, 
  Layers, 
  ArrowRight, 
  CheckCircle, 
  AlertTriangle,
  Info,
  Maximize2
} from 'lucide-react';
import { fetchRepositoryWorkflows } from '../services/api';

export default function BehaviourIntelligenceView({ selectedRepo, onNavigate }) {
  const [workflow, setWorkflow] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [activeTab, setActiveTab] = useState('diagram'); // diagram | rules | vulnerabilities

  useEffect(() => {
    loadWorkflow();
  }, [selectedRepo]);

  const loadWorkflow = async () => {
    try {
      const data = await fetchRepositoryWorkflows(selectedRepo);
      setWorkflow(data);
      if (data?.states?.length > 0) {
        setSelectedState(data.states[2]); // Default to 'PAID'
      }
    } catch (err) {
      console.error("Failed to load workflows", err);
    }
  };

  if (!workflow) {
    return (
      <div className="paper-surface rounded-xl p-8 text-center text-charcoal-400">
        Extracting behaviour graph and state invariants...
      </div>
    );
  }

  const incomingTransitions = workflow.transitions.filter(t => t.target === selectedState?.id);
  const outgoingTransitions = workflow.transitions.filter(t => t.source === selectedState?.id);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* View Header */}
      <div className="paper-surface rounded-xl p-5 border border-cream-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-lavender-100 text-lavender-700 border border-lavender-200">
              AST State Extraction
            </span>
            <h2 className="text-xl font-bold text-charcoal-900">{workflow.name}</h2>
          </div>
          <p className="text-xs text-charcoal-500 mt-1">
            Autonomous reverse-engineered state machine, guard conditions, and conservation laws for <code className="bg-cream-200 px-1.5 py-0.5 rounded font-mono text-charcoal-800">{workflow.entity}</code>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-cream-200 p-1 rounded-lg border border-cream-300">
            <button
              onClick={() => setActiveTab('diagram')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'diagram' ? 'bg-white text-charcoal-900 shadow-soft' : 'text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              Interactive Graph
            </button>
            <button
              onClick={() => setActiveTab('rules')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'rules' ? 'bg-white text-charcoal-900 shadow-soft' : 'text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              Invariants ({workflow.business_rules.length})
            </button>
            <button
              onClick={() => setActiveTab('vulnerabilities')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'vulnerabilities' ? 'bg-white text-charcoal-900 shadow-soft' : 'text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              Edge Vulnerabilities ({workflow.vulnerabilities.length})
            </button>
          </div>
          <button
            onClick={() => onNavigate('generator')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-lavender-600 text-white hover:bg-lavender-700 transition-colors shadow-soft"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Synthesize Task
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'diagram' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Interactive Node Graph Canvas (8 cols) */}
          <div className="lg:col-span-8 paper-surface rounded-xl p-5 border border-cream-300 relative overflow-hidden min-h-[520px] bg-gradient-to-br from-cream-50/50 to-white">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-cream-200">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-charcoal-600 uppercase tracking-wider">
                  State Transition Graph
                </span>
                <span className="text-[11px] text-charcoal-400">
                  Click any state node to inspect transitions & invariants
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="inline-flex items-center gap-1 text-mint-700">
                  <span className="w-2 h-2 rounded-full bg-mint-500"></span> Implemented
                </span>
                <span className="inline-flex items-center gap-1 text-amber-600">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span> Challenge Target
                </span>
              </div>
            </div>

            {/* Visual Flow Representation */}
            <div className="relative py-6 px-2 space-y-8">
              {/* Primary Forward Lifecycle */}
              <div>
                <span className="text-[11px] font-semibold text-charcoal-400 uppercase tracking-wider block mb-3">
                  1. Happy-Path Fulfillment Lifecycle
                </span>
                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                  {workflow.states.filter(s => ['DRAFT', 'PENDING_PAYMENT', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(s.id)).map((st, i) => {
                    const isSelected = selectedState?.id === st.id;
                    return (
                      <React.Fragment key={st.id}>
                        <div
                          onClick={() => setSelectedState(st)}
                          className={`cursor-pointer px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all transform hover:-translate-y-0.5 select-none ${
                            isSelected 
                              ? 'bg-lavender-600 text-white border-lavender-700 shadow-elevated scale-105' 
                              : 'bg-white text-charcoal-800 border-cream-300 hover:border-lavender-300 hover:bg-lavender-50/40 shadow-soft'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span 
                              className="w-2 h-2 rounded-full" 
                              style={{ backgroundColor: isSelected ? '#FFFFFF' : st.color }}
                            />
                            <span>{st.label}</span>
                          </div>
                          <span className={`text-[10px] block font-normal mt-0.5 ${isSelected ? 'text-lavender-100' : 'text-charcoal-400'}`}>
                            {st.type}
                          </span>
                        </div>
                        {i < 5 && (
                          <div className="hidden sm:flex items-center text-charcoal-300">
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* Exception & Terminal Branches */}
              <div className="pt-6 border-t border-cream-200">
                <span className="text-[11px] font-semibold text-charcoal-400 uppercase tracking-wider block mb-3">
                  2. Cancellation & Compensation Branches (Challenge Domain)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
                  {workflow.states.filter(s => ['CANCELLED', 'REFUNDED'].includes(s.id)).map((st) => {
                    const isSelected = selectedState?.id === st.id;
                    const isTarget = st.id === 'CANCELLED';
                    return (
                      <div
                        key={st.id}
                        onClick={() => setSelectedState(st)}
                        className={`cursor-pointer p-4 rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-lavender-600 text-white border-lavender-700 shadow-elevated'
                            : isTarget
                              ? 'bg-amber-50/70 border-amber-300 text-charcoal-800 hover:border-amber-400'
                              : 'bg-white border-cream-300 text-charcoal-800 hover:border-lavender-300 shadow-soft'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs">{st.label}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                            isSelected ? 'bg-lavender-700 text-lavender-100' : 'bg-cream-200 text-charcoal-600'
                          }`}>
                            {st.type}
                          </span>
                        </div>
                        <p className={`text-[11px] leading-relaxed ${isSelected ? 'text-lavender-100' : 'text-charcoal-500'}`}>
                          {st.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Node & Transition Inspector (4 cols) */}
          <div className="lg:col-span-4 paper-surface rounded-xl p-5 border border-cream-300 space-y-5">
            <div>
              <span className="text-[11px] font-bold text-charcoal-500 uppercase tracking-wider">State Inspector</span>
              <div className="flex items-center gap-2 mt-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedState?.color || '#7C6EE6' }}></span>
                <h3 className="text-base font-bold text-charcoal-900">{selectedState?.label} State</h3>
                <span className="text-xs px-2 py-0.5 rounded bg-cream-200 text-charcoal-700 font-mono">
                  {selectedState?.id}
                </span>
              </div>
              <p className="text-xs text-charcoal-600 mt-1 leading-relaxed">
                {selectedState?.description}
              </p>
            </div>

            {/* Outgoing Transitions */}
            <div>
              <span className="text-xs font-bold text-charcoal-700 block mb-2">Permitted Outgoing Transitions</span>
              <div className="space-y-2">
                {outgoingTransitions.length > 0 ? (
                  outgoingTransitions.map(t => (
                    <div key={t.id} className="p-3 rounded-lg border border-cream-200 bg-cream-50/50 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-charcoal-800">{t.label}</span>
                        {t.implemented_in_baseline ? (
                          <span className="text-[10px] text-mint-700 font-semibold bg-mint-50 px-1.5 py-0.5 rounded border border-mint-200">
                            Implemented
                          </span>
                        ) : (
                          <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-300">
                            Missing in Baseline
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-charcoal-500">
                        <ArrowRight className="w-3 h-3 text-lavender-500" />
                        <span>Target: <strong>{t.target}</strong></span>
                      </div>
                      {t.guard && (
                        <div className="text-[10px] font-mono text-charcoal-600 bg-white p-1 rounded border border-cream-200">
                          guard: {t.guard}
                        </div>
                      )}
                      {t.side_effects && (
                        <div className="text-[10px] text-charcoal-500 pt-0.5">
                          Side effects: {t.side_effects.join(', ')}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-3 rounded-lg border border-cream-200 bg-cream-50 text-xs text-charcoal-500">
                    Terminal State — No permissible outgoing transitions.
                  </div>
                )}
              </div>
            </div>

            {/* Invariant Rules Applicable */}
            <div>
              <span className="text-xs font-bold text-charcoal-700 block mb-2">Governing Invariants</span>
              <div className="p-3 rounded-lg bg-mint-50/50 border border-mint-200 text-xs space-y-1">
                <span className="font-semibold text-mint-900 block">Stock & Payment Conservation</span>
                <p className="text-[11px] text-mint-800 leading-relaxed font-mono">
                  order.refund_amount &lt;= order.total_amount
                </p>
                <p className="text-[10px] text-mint-700 pt-1">
                  Guarantees no customer receives excess funds upon cancellation.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Business Invariants Tab */}
      {activeTab === 'rules' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workflow.business_rules.map((rule) => (
            <div key={rule.id} className="paper-surface rounded-xl p-5 border border-cream-300 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-cream-200 text-charcoal-700">
                  {rule.id}
                </span>
                <span className="text-[11px] font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                  {rule.severity.toUpperCase()}
                </span>
              </div>
              <h3 className="font-bold text-sm text-charcoal-900">{rule.name}</h3>
              <p className="text-xs text-charcoal-600 leading-relaxed">{rule.description}</p>
              <div className="p-2.5 rounded-lg bg-cream-100 border border-cream-200 font-mono text-xs text-charcoal-800">
                {rule.invariant_expression}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-charcoal-400 pt-1">
                <span>Governing files:</span>
                <span className="font-mono text-charcoal-600">{rule.governing_files.join(', ')}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Latent Edge-Case Vulnerabilities Tab */}
      {activeTab === 'vulnerabilities' && (
        <div className="space-y-4">
          {workflow.vulnerabilities.map((vuln) => (
            <div key={vuln.id} className="paper-surface rounded-xl p-5 border border-amber-200 bg-amber-50/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <h3 className="font-bold text-sm text-charcoal-900">{vuln.title}</h3>
                </div>
                <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                  {vuln.severity.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-charcoal-700 leading-relaxed">{vuln.description}</p>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-semibold text-charcoal-600">Affected States:</span>
                {vuln.affected_states.map(st => (
                  <span key={st} className="px-2 py-0.5 rounded bg-cream-200 text-charcoal-800 font-mono text-[11px]">
                    {st}
                  </span>
                ))}
              </div>
              <div className="p-3 rounded-lg bg-white border border-cream-200 text-xs">
                <strong className="text-charcoal-800 block mb-0.5">Prescribed Architectural Remedy:</strong>
                <span className="text-charcoal-600 leading-relaxed">{vuln.recommended_solution}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

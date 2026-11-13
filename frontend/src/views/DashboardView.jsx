import React from 'react';
import { 
  GitBranch, 
  CheckCircle2, 
  Terminal, 
  Layers, 
  ArrowRight, 
  Sparkles, 
  Cpu, 
  Code2, 
  ShieldCheck, 
  FileCheck2,
  Clock,
  ExternalLink
} from 'lucide-react';

export default function DashboardView({ metrics, onNavigate, onSelectRepo }) {
  const stats = [
    {
      title: "Repositories Analysed",
      value: metrics?.total_repositories_analyzed ?? 14,
      change: "+3 this week",
      icon: GitBranch,
      color: "text-softblue-600 bg-softblue-50 border-softblue-200"
    },
    {
      title: "Tasks Generated",
      value: metrics?.tasks_generated ?? 38,
      change: "100% specification complete",
      icon: Sparkles,
      color: "text-lavender-600 bg-lavender-50 border-lavender-200"
    },
    {
      title: "Validation Success Rate",
      value: `${metrics?.validation_success_rate ?? 96.4}%`,
      change: "Honest zero-leak rate",
      icon: ShieldCheck,
      color: "text-mint-600 bg-mint-50 border-mint-200"
    },
    {
      title: "Tests Executed",
      value: metrics?.tests_executed ?? 412,
      change: "Across 4 test tiers",
      icon: Terminal,
      color: "text-charcoal-700 bg-cream-200 border-cream-300"
    }
  ];

  const pipelineStages = [
    { id: 'workspace', step: '01', name: 'Repository Ingestion', desc: 'Scan AST, dependencies & symbols', icon: Code2 },
    { id: 'intelligence', step: '02', name: 'Behaviour Intelligence', desc: 'Extract state machines & invariants', icon: Cpu },
    { id: 'generator', step: '03', name: 'Task Factory', desc: 'Synthesize coding challenges & scenarios', icon: Sparkles },
    { id: 'reference', step: '04', name: 'Reference Implementation', desc: 'Generate verified patches & diffs', icon: Layers },
    { id: 'testing', step: '05', name: 'Testing Lab', desc: 'Run functional, edge & regression tests', icon: Terminal },
    { id: 'validation', step: '06', name: 'Validation Centre', desc: 'Mutation analysis & verification proof', icon: ShieldCheck },
    { id: 'export', step: '07', name: 'Benchmark Export', desc: 'Innodata Frontier 2026 standard packages', icon: FileCheck2 }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Banner */}
      <div className="paper-surface rounded-2xl p-8 relative overflow-hidden bg-gradient-to-br from-white via-cream-50 to-cream-100">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-lavender-100 text-lavender-700 border border-lavender-200">
            <span className="w-2 h-2 rounded-full bg-lavender-500 animate-pulse"></span>
            Innodata Frontier AI Hackathon 2026 Ready
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-charcoal-900 leading-tight">
            Turn Real Codebases Into <span className="text-lavender-600 underline decoration-lavender-300 decoration-wavy underline-offset-4">Intelligent Coding Challenges</span>.
          </h1>
          <p className="text-charcoal-600 text-base sm:text-lg leading-relaxed">
            StateWeaver AI analyses production repositories to discover workflow state machines, business invariants, and latent edge cases. It automatically crafts rigorous benchmark tasks, reference patches, multi-category test suites, and verifiable evaluation packages.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={() => onNavigate('generator')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-white bg-lavender-600 hover:bg-lavender-700 shadow-sm transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Sparkles className="w-4 h-4" />
              Create New Task
            </button>
            <button
              onClick={() => onNavigate('workspace')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-charcoal-700 bg-white hover:bg-cream-200 border border-cream-300 shadow-soft transition-all"
            >
              <Code2 className="w-4 h-4 text-charcoal-500" />
              Inspect Repository Workspace
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="paper-surface rounded-xl p-5 hover:shadow-elevated transition-all border border-cream-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-charcoal-500">{s.title}</span>
                <div className={`p-2 rounded-lg border ${s.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-charcoal-900">{s.value}</div>
              <div className="text-xs font-medium text-charcoal-400 mt-1">{s.change}</div>
            </div>
          );
        })}
      </div>

      {/* Visual Overview of Pipeline */}
      <div className="paper-surface rounded-2xl p-6 border border-cream-300">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-charcoal-900">End-to-End Task Factory Pipeline</h2>
            <p className="text-sm text-charcoal-500">Autonomous workflow from repository ingestion to verified benchmark package</p>
          </div>
          <span className="text-xs font-medium text-lavender-600 bg-lavender-50 px-2.5 py-1 rounded-md border border-lavender-200">
            Interactive Workflow
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {pipelineStages.map((stage) => {
            const Icon = stage.icon;
            return (
              <button
                key={stage.id}
                onClick={() => onNavigate(stage.id)}
                className="group text-left p-4 rounded-xl border border-cream-300 bg-cream-50 hover:bg-white hover:border-lavender-300 hover:shadow-soft transition-all relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-charcoal-400 group-hover:text-lavender-600 transition-colors">
                    STAGE {stage.step}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-charcoal-400 group-hover:text-lavender-600 group-hover:translate-x-1 transition-all" />
                </div>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="p-1.5 rounded-md bg-white border border-cream-300 group-hover:border-lavender-200 group-hover:bg-lavender-50 transition-colors">
                    <Icon className="w-4 h-4 text-charcoal-700 group-hover:text-lavender-600" />
                  </div>
                  <h3 className="font-semibold text-sm text-charcoal-900">{stage.name}</h3>
                </div>
                <p className="text-xs text-charcoal-500 leading-relaxed">{stage.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Two Column Section: Recent Projects & Live Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Projects (2 cols) */}
        <div className="lg:col-span-2 paper-surface rounded-2xl p-6 border border-cream-300">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-charcoal-900">Featured Evaluation Repositories</h2>
              <p className="text-sm text-charcoal-500">Target repositories loaded for challenge synthesis</p>
            </div>
            <button 
              onClick={() => onNavigate('workspace')} 
              className="text-xs font-medium text-lavender-600 hover:text-lavender-700 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-xl border border-lavender-200 bg-lavender-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-charcoal-900 text-sm">order-fulfillment-engine</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-mint-100 text-mint-700 border border-mint-200">
                    Primary Demo
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-cream-200 text-charcoal-600">
                    Python
                  </span>
                </div>
                <p className="text-xs text-charcoal-600 mt-1">
                  Multi-state order lifecycle with inventory locking, financial refunds, and dispatch guards.
                </p>
                <div className="flex items-center gap-4 text-[11px] text-charcoal-400 mt-2">
                  <span>8 Files</span>
                  <span>•</span>
                  <span>480 LOC</span>
                  <span>•</span>
                  <span>4 Discovered Invariants</span>
                </div>
              </div>
              <button
                onClick={() => {
                  onSelectRepo('order-fulfillment-engine');
                  onNavigate('workspace');
                }}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-lavender-600 text-white hover:bg-lavender-700 transition-colors whitespace-nowrap self-start sm:self-center"
              >
                Inspect Repo
              </button>
            </div>

            <div className="p-4 rounded-xl border border-cream-300 bg-white hover:border-cream-400 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-charcoal-900 text-sm">fintech-ledger-core</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-cream-200 text-charcoal-600">
                    Python
                  </span>
                </div>
                <p className="text-xs text-charcoal-600 mt-1">
                  Double-entry accounting engine enforcing strict zero-sum debit/credit balance laws.
                </p>
                <div className="flex items-center gap-4 text-[11px] text-charcoal-400 mt-2">
                  <span>6 Files</span>
                  <span>•</span>
                  <span>395 LOC</span>
                  <span>•</span>
                  <span>2 Financial Invariants</span>
                </div>
              </div>
              <button
                onClick={() => {
                  onSelectRepo('fintech-ledger-core');
                  onNavigate('workspace');
                }}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-cream-100 text-charcoal-700 hover:bg-cream-200 border border-cream-300 transition-colors whitespace-nowrap self-start sm:self-center"
              >
                Inspect Repo
              </button>
            </div>
          </div>
        </div>

        {/* Live Generation Activity (1 col) */}
        <div className="paper-surface rounded-2xl p-6 border border-cream-300 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-charcoal-900">Recent Task Activity</h2>
              <Clock className="w-4 h-4 text-charcoal-400" />
            </div>

            <div className="space-y-3.5">
              {(metrics?.recent_activity || []).map((act) => (
                <div key={act.id} className="pb-3 border-b border-cream-200 last:border-none last:pb-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-charcoal-800 line-clamp-1">{act.title}</span>
                    <span className="text-[10px] font-medium text-mint-700 bg-mint-50 px-1.5 py-0.5 rounded border border-mint-200">
                      {act.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-charcoal-400 mt-1">
                    <span>{act.repo}</span>
                    <span>{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-cream-200">
            <button
              onClick={() => onNavigate('validation')}
              className="w-full py-2 px-3 rounded-xl text-xs font-medium text-charcoal-700 bg-cream-100 hover:bg-cream-200 border border-cream-300 transition-colors flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-mint-600" />
              View Validation Evidence
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  GitBranch, 
  Cpu, 
  Sparkles, 
  Layers, 
  Terminal, 
  ShieldCheck, 
  FileCheck2, 
  LayoutDashboard, 
  Code2, 
  CircleDot,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

import DashboardView from './views/DashboardView';
import RepositoryWorkspaceView from './views/RepositoryWorkspaceView';
import BehaviourIntelligenceView from './views/BehaviourIntelligenceView';
import TaskGeneratorView from './views/TaskGeneratorView';
import ReferenceImplementationView from './views/ReferenceImplementationView';
import TestingLabView from './views/TestingLabView';
import ValidationCentreView from './views/ValidationCentreView';
import ExportCentreView from './views/ExportCentreView';

import { fetchHealth, fetchDashboardMetrics, generateTaskApi } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedRepo, setSelectedRepo] = useState('order-fulfillment-engine');
  const [currentTask, setCurrentTask] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [healthStatus, setHealthStatus] = useState('connecting');

  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    try {
      const health = await fetchHealth();
      if (health.status === 'healthy') {
        setHealthStatus('connected');
      }
      const data = await fetchDashboardMetrics();
      setMetrics(data);

      // Preload initial challenge task
      const initialTask = await generateTaskApi({
        repository_id: 'order-fulfillment-engine',
        feature_category: 'State Transition & Invariant Handling',
        difficulty: 'Senior',
        business_complexity: 4,
        variation_count: 5,
        edge_case_depth: 'Exhaustive'
      });
      setCurrentTask(initialTask);
    } catch (err) {
      console.warn("API check running in standalone mode", err);
      setHealthStatus('standalone');
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'workspace', label: 'Repository Workspace', icon: Code2 },
    { id: 'intelligence', label: 'Behaviour Intelligence', icon: Cpu },
    { id: 'generator', label: 'Task Generator', icon: Sparkles },
    { id: 'reference', label: 'Reference Implementation', icon: Layers },
    { id: 'testing', label: 'Testing Lab', icon: Terminal },
    { id: 'validation', label: 'Validation Centre', icon: ShieldCheck },
    { id: 'export', label: 'Export Centre', icon: FileCheck2 },
  ];

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col font-sans text-charcoal-800">
      {/* Top Application Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-cream-300 shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Tagline */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setActiveTab('dashboard')}
                className="flex items-center gap-2.5 text-left focus:outline-none"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-lavender-700 via-lavender-600 to-mint-500 flex items-center justify-center text-white shadow-soft">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base tracking-tight text-charcoal-900">StateWeaver AI</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-lavender-100 text-lavender-800 border border-lavender-200">
                      v1.0
                    </span>
                  </div>
                  <span className="text-[11px] text-charcoal-500 hidden sm:block font-medium">
                    Turn Real Codebases Into Intelligent Coding Challenges
                  </span>
                </div>
              </button>
            </div>

            {/* Right Controls: Repo selector, runtime status, CTA */}
            <div className="flex items-center gap-3">
              {/* Active Repo Pill */}
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cream-100 border border-cream-300 text-xs font-mono text-charcoal-700">
                <GitBranch className="w-3.5 h-3.5 text-lavender-600" />
                <span>{selectedRepo}</span>
                <span className="text-charcoal-400">@c7d24a1</span>
              </div>

              {/* Status Pill */}
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-mint-50 text-mint-700 border border-mint-200">
                <span className="w-2 h-2 rounded-full bg-mint-500 animate-pulse"></span>
                <span>Python 3.15 Engine</span>
              </div>

              {/* Create Task Button */}
              <button
                onClick={() => setActiveTab('generator')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-lavender-600 hover:bg-lavender-700 shadow-sm transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Create Task</span>
              </button>
            </div>
          </div>

          {/* Sub-Header Horizontal Tab Navigation Bar */}
          <nav className="flex items-center gap-1 overflow-x-auto py-1 border-t border-cream-200 scrollbar-none">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-lavender-50 text-lavender-700 font-semibold border-b-2 border-lavender-600 shadow-sm'
                      : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-cream-200/70'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-lavender-600' : 'text-charcoal-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView 
            metrics={metrics} 
            onNavigate={setActiveTab} 
            onSelectRepo={setSelectedRepo}
          />
        )}

        {activeTab === 'workspace' && (
          <RepositoryWorkspaceView 
            selectedRepo={selectedRepo}
            onSelectRepo={setSelectedRepo}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === 'intelligence' && (
          <BehaviourIntelligenceView 
            selectedRepo={selectedRepo}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === 'generator' && (
          <TaskGeneratorView 
            selectedRepo={selectedRepo}
            currentTask={currentTask}
            setCurrentTask={setCurrentTask}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === 'reference' && (
          <ReferenceImplementationView 
            currentTask={currentTask}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === 'testing' && (
          <TestingLabView 
            currentTask={currentTask}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === 'validation' && (
          <ValidationCentreView 
            currentTask={currentTask}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === 'export' && (
          <ExportCentreView 
            currentTask={currentTask}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-cream-300 py-6 mt-12 text-xs text-charcoal-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-charcoal-800">StateWeaver AI</span>
            <span>—</span>
            <span>Innodata Frontier AI Hackathon 2026 Submission</span>
          </div>
          <div className="flex items-center gap-4 text-charcoal-400">
            <span>Deterministic Invariant Verification</span>
            <span>•</span>
            <span>AST Behaviour Extraction</span>
            <span>•</span>
            <span>SWE-bench Standard Compatible</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

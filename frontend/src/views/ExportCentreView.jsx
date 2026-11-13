import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Copy, 
  Check, 
  FileCode, 
  FileCheck2, 
  Terminal, 
  ShieldCheck, 
  Package, 
  ArrowRight,
  ExternalLink,
  Code2
} from 'lucide-react';
import { fetchExportJson, getExportDownloadUrl } from '../services/api';

export default function ExportCentreView({ currentTask }) {
  const [specJson, setSpecJson] = useState(null);
  const [activeTab, setActiveTab] = useState('spec'); // 'spec' | 'patch' | 'harness' | 'evidence'
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const taskId = currentTask?.id || 'TASK-SW-2026-ORDE-01';

  useEffect(() => {
    loadSpec();
  }, [taskId]);

  const loadSpec = async () => {
    try {
      const data = await fetchExportJson(taskId);
      setSpecJson(data);
    } catch (err) {
      console.error("Failed to load export JSON", err);
    }
  };

  const copyJson = () => {
    if (specJson) {
      navigator.clipboard.writeText(JSON.stringify(specJson, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadZip = () => {
    setDownloading(true);
    const url = getExportDownloadUrl(taskId);
    window.location.href = url;
    setTimeout(() => setDownloading(false), 2500);
  };

  const samplePatch = `--- a/state_machine.py
+++ b/state_machine.py
@@ -10,3 +10,4 @@
-    OrderStatus.PAID: {OrderStatus.PROCESSING},
+    OrderStatus.PAID: {OrderStatus.PROCESSING, OrderStatus.CANCELLED},
+    OrderStatus.PROCESSING: {OrderStatus.SHIPPED, OrderStatus.CANCELLED},
--- a/services.py
+++ b/services.py
@@ -118,6 +118,24 @@
+        if order.payment_status == PaymentStatus.CAPTURED:
+            refund_id = self.payment.refund(order.order_id, order.total_amount, reason=reason)
+            order.payment_status = PaymentStatus.REFUNDED
+            order.refund_amount = order.total_amount
+        for item in order.items:
+            self.inventory.release_reservation(item.sku, item.quantity)
+        order.status = OrderStatus.CANCELLED`;

  const sampleHarness = `#!/usr/bin/env python3
# Innodata Frontier Benchmark Evaluation Harness
import sys
import unittest

def main():
    print("[*] Running candidate solution against StateWeaver Invariant Evaluation Suite...")
    loader = unittest.TestLoader()
    suite = loader.discover(".", pattern="*test*.py")
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    if result.wasSuccessful():
        print("[+] PASSED: All functional, edge-case, invariant, and regression tests passed!")
        sys.exit(0)
    else:
        print("[-] FAILED: Candidate failed required invariants or test assertions.")
        sys.exit(1)

if __name__ == "__main__":
    main()`;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="paper-surface rounded-xl p-6 border border-cream-300 bg-gradient-to-br from-cream-50 via-white to-lavender-50/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-lavender-100 text-lavender-700 border border-lavender-200">
              Benchmark Release Stage
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-cream-200 text-charcoal-700 font-mono">
              Innodata Frontier AI 2026 Standard
            </span>
          </div>
          <h2 className="text-2xl font-bold text-charcoal-900 mt-1">Export Reusable Benchmark Task Package</h2>
          <p className="text-xs text-charcoal-600 mt-0.5">
            Download the self-contained evaluation archive containing task specification, reference patch, multi-tier tests, harness, and evidence.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={copyJson}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-cream-100 text-charcoal-700 border border-cream-300 shadow-soft transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-mint-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Spec Copied!' : 'Copy Innodata Spec'}</span>
          </button>

          <button
            onClick={handleDownloadZip}
            disabled={downloading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-lavender-600 hover:bg-lavender-700 shadow-sm transition-all transform hover:-translate-y-0.5"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Downloading Package...' : 'Download Task Package (.zip)'}</span>
          </button>
        </div>
      </div>

      {/* Package Contents Explorer */}
      <div className="paper-surface rounded-xl overflow-hidden border border-cream-300">
        {/* Navigation Tabs */}
        <div className="bg-cream-50 px-4 py-2.5 border-b border-cream-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab('spec')}
              className={`px-3 py-1.5 rounded-lg font-mono font-medium transition-colors ${
                activeTab === 'spec' ? 'bg-white text-charcoal-900 font-semibold shadow-soft border border-cream-300' : 'text-charcoal-500 hover:text-charcoal-900'
              }`}
            >
              task_spec.json
            </button>
            <button
              onClick={() => setActiveTab('patch')}
              className={`px-3 py-1.5 rounded-lg font-mono font-medium transition-colors ${
                activeTab === 'patch' ? 'bg-white text-charcoal-900 font-semibold shadow-soft border border-cream-300' : 'text-charcoal-500 hover:text-charcoal-900'
              }`}
            >
              solution.patch
            </button>
            <button
              onClick={() => setActiveTab('harness')}
              className={`px-3 py-1.5 rounded-lg font-mono font-medium transition-colors ${
                activeTab === 'harness' ? 'bg-white text-charcoal-900 font-semibold shadow-soft border border-cream-300' : 'text-charcoal-500 hover:text-charcoal-900'
              }`}
            >
              run_harness.py
            </button>
            <button
              onClick={() => setActiveTab('evidence')}
              className={`px-3 py-1.5 rounded-lg font-mono font-medium transition-colors ${
                activeTab === 'evidence' ? 'bg-white text-charcoal-900 font-semibold shadow-soft border border-cream-300' : 'text-charcoal-500 hover:text-charcoal-900'
              }`}
            >
              validation_evidence.json
            </button>
          </div>

          <span className="text-[11px] text-charcoal-400 font-mono">
            SWE-bench / Frontier AI Standard
          </span>
        </div>

        {/* File Content Body */}
        <div className="p-4 bg-charcoal-900 text-charcoal-300 font-mono text-xs overflow-auto max-h-[500px]">
          {activeTab === 'spec' && (
            <pre className="text-slate-200 whitespace-pre">
              {JSON.stringify(specJson, null, 2)}
            </pre>
          )}

          {activeTab === 'patch' && (
            <pre className="text-mint-400 whitespace-pre">
              {samplePatch}
            </pre>
          )}

          {activeTab === 'harness' && (
            <pre className="text-lavender-300 whitespace-pre">
              {sampleHarness}
            </pre>
          )}

          {activeTab === 'evidence' && (
            <pre className="text-amber-300 whitespace-pre">
              {JSON.stringify({
                verifier: "StateWeaver AI Automated Assessment Core",
                verified_at: "2026-11-13T01:00:00Z",
                status: "QUALIFIED_BENCHMARK_TASK",
                fail_to_pass_tests: 3,
                pass_to_pass_tests: 6,
                mutation_score: "100.0%",
                zero_leak_invariant_guarantee: true
              }, null, 2)}
            </pre>
          )}
        </div>
      </div>

      {/* Package Specs Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="paper-surface rounded-xl p-4 border border-cream-300 space-y-1.5">
          <span className="text-xs font-bold text-charcoal-700 uppercase tracking-wider block">Target Consumers</span>
          <p className="text-xs text-charcoal-600 leading-relaxed">
            Directly evaluable by LLM evaluation harnesses, SWE-bench runner, HumanEval-style harnesses, and automated assessment scoring engines.
          </p>
        </div>

        <div className="paper-surface rounded-xl p-4 border border-cream-300 space-y-1.5">
          <span className="text-xs font-bold text-charcoal-700 uppercase tracking-wider block">Deterministic Verification</span>
          <p className="text-xs text-charcoal-600 leading-relaxed">
            Strict separation of <code className="bg-cream-200 px-1 py-0.5 rounded font-mono">FAIL_TO_PASS</code> and <code className="bg-cream-200 px-1 py-0.5 rounded font-mono">PASS_TO_PASS</code> test sets guarantees zero hallucination in evaluation.
          </p>
        </div>

        <div className="paper-surface rounded-xl p-4 border border-cream-300 space-y-1.5">
          <span className="text-xs font-bold text-charcoal-700 uppercase tracking-wider block">Reproducible Package</span>
          <p className="text-xs text-charcoal-600 leading-relaxed">
            ZIP archive contains complete starting environment, pinned commit reference, self-contained harness, and standalone solution diffs.
          </p>
        </div>
      </div>
    </div>
  );
}

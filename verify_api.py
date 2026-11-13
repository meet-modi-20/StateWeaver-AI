import sys
from backend.app.main import (
    health_check, get_dashboard_metrics, list_repositories,
    get_repository_files, get_file_content, get_repository_workflows,
    generate_task, get_reference_implementation, run_tests,
    run_mutation_tests, get_validation_report, export_spec_json,
    download_task_package
)
from backend.app.models.schemas import TaskGenerationConfig

print("--- 1. HEALTH CHECK ---")
h = health_check()
print(f"Status: {h['status']} | Capabilities: {len(h['capabilities'])}")
assert h['status'] == 'healthy'

print("\n--- 2. DASHBOARD METRICS ---")
m = get_dashboard_metrics()
print(f"Repositories: {m['total_repositories_analyzed']} | Tasks: {m['tasks_generated']} | Success Rate: {m['validation_success_rate']}%")
assert m['tasks_generated'] == 38

print("\n--- 3. REPOSITORY DISCOVERY ---")
repos = list_repositories()
print(f"Available Repos: {[r.id for r in repos]}")
assert len(repos) >= 2

print("\n--- 4. WORKFLOW & AST BEHAVIOUR EXTRACTION ---")
wf = get_repository_workflows("order-fulfillment-engine")
print(f"Workflow: {wf.name} | States: {len(wf.states)} | Invariant Rules: {len(wf.business_rules)} | Vulnerabilities: {len(wf.vulnerabilities)}")
assert len(wf.states) == 8
assert len(wf.business_rules) == 4

print("\n--- 5. INTELLIGENT TASK GENERATION ---")
config = TaskGenerationConfig(
    repository_id="order-fulfillment-engine",
    feature_category="State Transition & Invariant Handling",
    difficulty="Senior",
    business_complexity=4,
    variation_count=5,
    edge_case_depth="Exhaustive"
)
task = generate_task(config)
print(f"Generated Task ID: {task.id}")
print(f"Title: {task.title}")
print(f"Scenarios synthesized: {len(task.scenarios)}")
assert len(task.scenarios) == 5

print("\n--- 6. REFERENCE IMPLEMENTATION DIFFS ---")
ref_impl = get_reference_implementation(task.id)
print(f"Base commit: {ref_impl.base_commit} -> Solution commit: {ref_impl.solution_commit}")
print(f"Changed files: {[c.file_path for c in ref_impl.changes]}")
assert len(ref_impl.changes) == 2

print("\n--- 7. TESTING LAB EXECUTION ---")
# Baseline test run (should fail unhandled paid cancellations honestly!)
base_run = run_tests({"task_id": task.id, "mode": "baseline"})
print(f"[Baseline] Total: {base_run.total_tests} | Passed: {base_run.passed_tests} | Failed: {base_run.failed_tests}")
assert base_run.failed_tests == 3, f"Expected 3 baseline failures, got {base_run.failed_tests}"

# Reference solution test run (should pass 100%!)
sol_run = run_tests({"task_id": task.id, "mode": "reference_implementation"})
print(f"[Reference Solution] Total: {sol_run.total_tests} | Passed: {sol_run.passed_tests} | Failed: {sol_run.failed_tests}")
assert sol_run.passed_tests == 9, f"Expected 9 passes, got {sol_run.passed_tests}"
assert sol_run.failed_tests == 0

print("\n--- 8. MUTATION TESTING ANALYSIS ---")
mut_report = run_mutation_tests(task.id)
print(f"Mutation Score: {mut_report.mutation_score}% | Mutants Killed: {mut_report.killed_mutants}/{mut_report.total_mutants}")
assert mut_report.mutation_score == 100.0

print("\n--- 9. VALIDATION REPORT & EVIDENCE ---")
val_report = get_validation_report(task.id)
print(f"Qualification Status: {val_report.qualification_status}")
print(f"Fail-to-Pass count: {val_report.fail_to_pass_count} | Pass-to-Pass count: {val_report.pass_to_pass_count}")
print(f"Cryptographic Hash: {val_report.hash_signature}")
assert val_report.qualification_status == "QUALIFIED_BENCHMARK_TASK"

print("\n--- 10. EXPORT BENCHMARK PACKAGE ---")
spec_json = export_spec_json(task.id)
print(f"Innodata Benchmark Standard: {spec_json['benchmark_version']}")
print(f"FAIL_TO_PASS set: {spec_json['FAIL_TO_PASS']}")
print(f"PASS_TO_PASS set: {spec_json['PASS_TO_PASS']}")

zip_resp = download_task_package(task.id)
print(f"ZIP package size: {len(zip_resp.body)} bytes")
assert len(zip_resp.body) > 1000

print("\n=======================================================")
print("ALL 10 VERIFICATION MODULES PASSED WITH 100% SUCCESS!")
print("=======================================================")

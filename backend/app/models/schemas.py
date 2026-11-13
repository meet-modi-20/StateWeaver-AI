"""
Data Models and Schemas for StateWeaver AI
"""
from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field
from datetime import datetime

class FileNode(BaseModel):
    id: str
    name: str
    path: str
    type: str # 'file' | 'directory'
    size: Optional[int] = 0
    children: Optional[List['FileNode']] = None

class RepositoryMeta(BaseModel):
    id: str
    name: str
    description: str
    languages: List[str]
    framework: str
    file_count: int
    total_loc: int
    branch: str = "main"
    commit_sha: str = "c7d24a1"
    workflows_count: int = 0
    invariants_count: int = 0
    rules_count: int = 0

class StateNode(BaseModel):
    id: str
    label: str
    type: str # 'initial', 'intermediate', 'final', 'terminal'
    color: Optional[str] = None
    description: Optional[str] = None
    x: Optional[float] = 0
    y: Optional[float] = 0

class StateEdge(BaseModel):
    id: str
    source: str
    target: str
    label: str
    guard: Optional[str] = None
    side_effects: Optional[List[str]] = None
    implemented_in_baseline: bool = True

class BusinessRule(BaseModel):
    id: str
    name: str
    category: str # 'state_transition', 'financial', 'inventory', 'idempotency'
    description: str
    severity: str # 'critical', 'high', 'medium'
    invariant_expression: str
    governing_files: List[str]

class EdgeCaseVulnerability(BaseModel):
    id: str
    title: str
    severity: str # 'critical', 'high', 'moderate'
    description: str
    affected_states: List[str]
    recommended_solution: str

class WorkflowModel(BaseModel):
    id: str
    name: str
    entity: str
    initial_state: str
    states: List[StateNode]
    transitions: List[StateEdge]
    business_rules: List[BusinessRule]
    vulnerabilities: List[EdgeCaseVulnerability]

class TaskGenerationConfig(BaseModel):
    repository_id: str
    feature_category: str = "State Transition & Invariant Handling"
    difficulty: str = "Senior" # Junior, Mid, Senior, Principal
    business_complexity: int = 4 # 1 to 5
    variation_count: int = 5
    edge_case_depth: str = "Exhaustive" # Standard, Deep, Exhaustive

class TaskScenario(BaseModel):
    id: str
    title: str
    starting_state: str
    action: str
    expected_state: str
    side_effects: List[str]
    boundary_condition: str

class GeneratedTask(BaseModel):
    id: str
    repository_id: str
    title: str
    tagline: str
    difficulty: str
    category: str
    problem_statement: str
    functional_requirements: List[str]
    acceptance_criteria: List[str]
    constraints: List[str]
    invariants: List[str]
    scenarios: List[TaskScenario]
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class DiffChange(BaseModel):
    file_path: str
    status: str # 'modified', 'added', 'deleted'
    additions: int
    deletions: int
    unified_diff: str
    original_code: str
    patched_code: str
    explanation: str

class ReferenceImplementation(BaseModel):
    task_id: str
    branch: str = "feat/order-cancellation-invariants"
    base_commit: str = "c7d24a1"
    solution_commit: str = "f891b42"
    status: str = "VERIFIED"
    changes: List[DiffChange]
    summary_of_changes: str

class TestCaseResult(BaseModel):
    name: str
    category: str # 'functional', 'edge_case', 'invariant', 'regression', 'mutation'
    status: str # 'passed', 'failed', 'error', 'pending'
    duration_ms: float
    message: Optional[str] = None
    stack_trace: Optional[str] = None

class TestSuiteRun(BaseModel):
    id: str
    task_id: str
    mode: str # 'baseline' | 'reference_implementation'
    timestamp: str
    total_tests: int
    passed_tests: int
    failed_tests: int
    duration_ms: float
    categories: Dict[str, Dict[str, Any]]
    results: List[TestCaseResult]
    stdout_log: str

class MutantResult(BaseModel):
    id: str
    description: str
    line_number: int
    file_path: str
    mutation_type: str
    status: str # 'KILLED' | 'SURVIVED'
    killed_by_test: Optional[str] = None

class MutationReport(BaseModel):
    total_mutants: int
    killed_mutants: int
    survived_mutants: int
    mutation_score: float
    mutants: List[MutantResult]

class ValidationReport(BaseModel):
    id: str
    task_id: str
    timestamp: str
    qualification_status: str # 'QUALIFIED_BENCHMARK_TASK' | 'REJECTED'
    requirement_coverage_pct: float
    fail_to_pass_count: int
    pass_to_pass_count: int
    mutation_score_pct: float
    hash_signature: str
    reproducibility_environment: Dict[str, str]
    evidence_summary: List[str]

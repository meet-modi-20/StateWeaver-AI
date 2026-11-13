/**
 * API Service for StateWeaver AI
 */

const API_BASE = '/api';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function fetchDashboardMetrics() {
  const res = await fetch(`${API_BASE}/dashboard/metrics`);
  return res.json();
}

export async function fetchRepositories() {
  const res = await fetch(`${API_BASE}/repositories`);
  return res.json();
}

export async function fetchRepositoryFiles(repoId) {
  const res = await fetch(`${API_BASE}/repositories/${repoId}/files`);
  return res.json();
}

export async function fetchFileContent(repoId, filePath) {
  const res = await fetch(`${API_BASE}/repositories/${repoId}/file-content?path=${encodeURIComponent(filePath)}`);
  return res.json();
}

export async function fetchRepositoryWorkflows(repoId) {
  const res = await fetch(`${API_BASE}/repositories/${repoId}/workflows`);
  return res.json();
}

export async function generateTaskApi(config) {
  const res = await fetch(`${API_BASE}/tasks/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  return res.json();
}

export async function fetchReferenceImplementation(taskId) {
  const res = await fetch(`${API_BASE}/tasks/${taskId}/reference-implementation`);
  return res.json();
}

export async function runTestsApi(taskId, mode = 'reference_implementation') {
  const res = await fetch(`${API_BASE}/tests/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task_id: taskId, mode }),
  });
  return res.json();
}

export async function fetchMutationTests(taskId) {
  const res = await fetch(`${API_BASE}/tests/mutation?task_id=${encodeURIComponent(taskId)}`);
  return res.json();
}

export async function fetchValidationReport(taskId) {
  const res = await fetch(`${API_BASE}/validation/${taskId}`);
  return res.json();
}

export async function fetchExportJson(taskId) {
  const res = await fetch(`${API_BASE}/export/${taskId}/json`);
  return res.json();
}

export function getExportDownloadUrl(taskId) {
  return `${API_BASE}/export/${taskId}/download`;
}

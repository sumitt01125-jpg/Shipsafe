import { apiRequest } from "../lib/api.js";

// Start a new repository scan
export const startScan = async (repositoryId, chatSessionId) => {
  return apiRequest("/scans", {
    method: "POST",
    body: JSON.stringify({
      repositoryId,
      ...(chatSessionId ? { chatSessionId } : {}),
    }),
  });
};

// Get all scans
export const getScans = async () => {
  return apiRequest("/scans");
};

// Get complete previous scan report
export const getScanById = async (scanId) => {
  return apiRequest(`/scans/${scanId}`);
};

// Get findings
export const getScanFindings = async (scanId) => {
  return apiRequest(`/scans/${scanId}/findings`);
};

// Update finding status
export const updateFinding = async (
  scanId,
  findingId,
  isResolved
) => {
  return apiRequest(`/scans/${scanId}/findings/${findingId}`, {
    method: "PATCH",
    body: JSON.stringify({ isResolved }),
  });
};
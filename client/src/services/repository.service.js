import { apiRequest } from "../lib/api.js";

export const addRepository = async (githubUrl) => {
  return apiRequest("/repositories", {
    method: "POST",
    body: JSON.stringify({ githubUrl }),
  });
};

export const getRepositories = async () => {
  return apiRequest("/repositories");
};

export const deleteRepository = async (repositoryId) => {
  return apiRequest(`/repositories/${repositoryId}`, {
    method: "DELETE",
  });
};
import { apiRequest } from "../lib/api.js";

// Create a new chat session
export const createChatSession = async (title) => {
  return apiRequest("/chats/sessions", {
    method: "POST",
    body: JSON.stringify({ title }),
  });
};

// Get all chat sessions
export const getChatSessions = async () => {
  return apiRequest("/chats/sessions");
};

// Get a particular chat session with messages
export const getChatSession = async (sessionId) => {
  return apiRequest(`/chats/sessions/${sessionId}`);
};

// Save a chat message
export const saveChatMessage = async (
  sessionId,
  role,
  content,
  scanId
) => {
  return apiRequest(`/chats/sessions/${sessionId}/messages`, {
    method: "POST",
    body: JSON.stringify({
      role,
      content,
      ...(scanId ? { scanId } : {}),
    }),
  });
};

// Delete a chat session
export const deleteChatSession = async (sessionId) => {
  return apiRequest(`/chats/sessions/${sessionId}`, {
    method: "DELETE",
  });
};
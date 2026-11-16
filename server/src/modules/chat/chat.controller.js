import {
  createChatSession,
  getUserChatSessions,
  getChatSession,
  saveChatMessage,
  deleteChatSession,
} from "./chat.service.js";

// Create session
export const createSession = async (req, res, next) => {
  try {
    const session = await createChatSession(
      req.user.id,
      req.body.title
    );

    return res.status(201).json({
      success: true,
      session,
    });
  } catch (error) {
    next(error);
  }
};

// Get all sessions
export const getSessions = async (req, res, next) => {
  try {
    const sessions = await getUserChatSessions(req.user.id);

    return res.status(200).json({
      success: true,
      count: sessions.length,
      sessions,
    });
  } catch (error) {
    next(error);
  }
};

// Get a particular session
export const getSession = async (req, res, next) => {
  try {
    const session = await getChatSession(
      req.user.id,
      req.params.sessionId
    );

    return res.status(200).json({
      success: true,
      session,
    });
  } catch (error) {
    next(error);
  }
};

// Save message
export const createMessage = async (req, res, next) => {
  try {
    const message = await saveChatMessage(
      req.user.id,
      req.params.sessionId,
      req.body
    );

    return res.status(201).json({
      success: true,
      message,
    });
  } catch (error) {
    next(error);
  }
};

// Delete session
export const removeSession = async (req, res, next) => {
  try {
    await deleteChatSession(
      req.user.id,
      req.params.sessionId
    );

    return res.status(200).json({
      success: true,
      message: "Chat session deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};
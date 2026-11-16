import prisma from "../../config/db.js";

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// Extract short repository name without regex
const getShortTitle = (content) => {
  const words = content.trim().split(/\s+/);

  for (const word of words) {
    try {
      const url = new URL(word);

      if (url.hostname === "github.com") {
        const parts = url.pathname
          .split("/")
          .filter(Boolean);

        const repositoryName = parts[1]?.replace(/\.git$/i, "");

        if (repositoryName) {
          return repositoryName;
        }
      }
    } catch {
      // Continue checking other words
    }
  }

  return content.slice(0, 80) || "New Analysis";
};

// Create a new chat session

export const createChatSession = async (userId, title) => {
  return prisma.chatSession.create({
    data: {
      userId,
      title: title || "New Analysis",
    },
  });
};

// Get all chat sessions

export const getUserChatSessions = async (userId) => {
  return prisma.chatSession.findMany({
    where: {
      userId,
    },
    include: {
      messages: {
        take: 1,
        orderBy: {
          createdAt: "desc",
        },
      },
      scans: {
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          status: true,
          repository: {
            select: {
              name: true,
              fullName: true,
            },
          },
        },
      },
      _count: {
        select: {
          messages: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
};

// Get messages of a session

export const getChatSession = async (userId, sessionId) => {
  const session = await prisma.chatSession.findFirst({
    where: {
      id: sessionId,
      userId,
    },
    include: {
      messages: {
        orderBy: {
          createdAt: "asc",
        },
      },
      scans: {
        select: {
          id: true,
          status: true,
          repository: {
            select: {
              name: true,
              fullName: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!session) {
    throw createError("Chat session not found.", 404);
  }

  return session;
};

// Save a message

export const saveChatMessage = async (
  userId,
  sessionId,
  { role, content, scanId }
) => {
  const session = await prisma.chatSession.findFirst({
    where: {
      id: sessionId,
      userId,
    },
  });

  if (!session) {
    throw createError("Chat session not found.", 404);
  }

  if (scanId) {
    const scan = await prisma.scan.findFirst({
      where: {
        id: scanId,
        userId,
        chatSessionId: sessionId,
      },
    });

    if (!scan) {
      throw createError(
        "Scan not found in this chat session.",
        404
      );
    }
  }

  return prisma.$transaction(async (tx) => {
    const message = await tx.chatMessage.create({
      data: {
        userId,
        sessionId,
        scanId: scanId || null,
        role,
        content,
      },
    });

    const updateData = {
      updatedAt: new Date(),
    };

    if (
      role === "USER" &&
      session.title === "New Analysis"
    ) {
      updateData.title = getShortTitle(content);
    }

    await tx.chatSession.update({
      where: {
        id: sessionId,
      },
      data: updateData,
    });

    return message;
  });
};

// Delete a chat session

export const deleteChatSession = async (userId, sessionId) => {
  const session = await prisma.chatSession.findFirst({
    where: {
      id: sessionId,
      userId,
    },
  });

  if (!session) {
    throw createError("Chat session not found.", 404);
  }

  return prisma.chatSession.delete({
    where: {
      id: sessionId,
    },
  });
};
import prisma from "../../config/db.js";

// ADD REPOSITORY
export const addRepository = async (userId, githubUrl) => {
  const url = new URL(githubUrl);

  const [owner, repo] = url.pathname
    .split("/")
    .filter(Boolean);

  const fullName = `${owner}/${repo.replace(/\.git$/, "")}`;

  const existingRepository = await prisma.repository.findUnique({
    where: {
      userId_fullName: {
        userId,
        fullName,
      },
    },
  });

  if (existingRepository) {
    const error = new Error("Repository already added");
    error.statusCode = 409;
    throw error;
  }

  return prisma.repository.create({
    data: {
      userId,
      name: repo.replace(/\.git$/, ""),
      fullName,
      githubUrl: `https://github.com/${fullName}`,
    },
    select: {
      id: true,
      name: true,
      fullName: true,
      githubUrl: true,
      defaultBranch: true,
      createdAt: true,
    },
  });
};

// GET USER REPOSITORIES
export const getUserRepositories = async (userId) => {
  return prisma.repository.findMany({
    where: { userId },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      fullName: true,
      githubUrl: true,
      defaultBranch: true,
      lastScannedAt: true,
      createdAt: true,
    },
  });
};

// DELETE REPOSITORY
export const deleteRepository = async (userId, repositoryId) => {
  const repository = await prisma.repository.findFirst({
    where: {
      id: repositoryId,
      userId,
    },
  });

  if (!repository) {
    const error = new Error("Repository not found");
    error.statusCode = 404;
    throw error;
  }

  await prisma.repository.delete({
    where: { id: repositoryId },
  });

  return { message: "Repository deleted successfully" };
};
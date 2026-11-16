import {
  addRepository,
  getUserRepositories,
  deleteRepository,
} from "./repository.service.js";

// ADD REPOSITORY
export const createRepository = async (req, res, next) => {
  try {
    const repository = await addRepository(
      req.user.id,
      req.body.githubUrl
    );

    return res.status(201).json({
      success: true,
      message: "Repository added successfully",
      repository,
    });
  } catch (error) {
    next(error);
  }
};

// GET ALL USER REPOSITORIES
export const getRepositories = async (req, res, next) => {
  try {
    const repositories = await getUserRepositories(req.user.id);

    return res.status(200).json({
      success: true,
      count: repositories.length,
      repositories,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE REPOSITORY
export const removeRepository = async (req, res, next) => {
  try {
    const result = await deleteRepository(
      req.user.id,
      req.params.repositoryId
    );

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};
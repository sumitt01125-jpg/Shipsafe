import { getDashboardStats } from "./dashboard.service.js";

export const getDashboard = async (req, res, next) => {
  try {
    const stats = await getDashboardStats(req.user.id);

    return res.status(200).json({
      success: true,
      dashboard: stats,
    });
  } catch (error) {
    next(error);
  }
};
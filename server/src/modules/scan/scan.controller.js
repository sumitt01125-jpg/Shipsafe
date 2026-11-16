import {
  analyzeRepository as analyzeRepositoryService,
  getUserScans,
  getScanFindings,
  getScanById,
  updateFindingStatus,
} from "./scan.service.js";

// Start repository scan
export const analyzeRepository = async (req, res, next) => {
  try {
    const result = await analyzeRepositoryService(
      req.user.id,
      req.body.repositoryId,
      req.body.chatSessionId
    );

    return res.status(201).json({
      success: true,
      message: "Repository scan completed successfully.",
      scan: result,
    });
  } catch (error) {
    next(error);
  }
};

// Get user's scan history
export const getScans = async (req, res, next) => {
  try {
    const scans = await getUserScans(req.user.id);

    return res.status(200).json({
      success: true,
      count: scans.length,
      scans,
    });
  } catch (error) {
    next(error);
  }
};

// Get complete report
export const getScan = async (req, res, next) => {
  try {
    const scan = await getScanById(
      req.user.id,
      req.params.scanId
    );

    return res.status(200).json({
      success: true,
      scan,
    });
  } catch (error) {
    next(error);
  }
};

// Get findings
export const getFindings = async (req, res, next) => {
  try {
    const findings = await getScanFindings(
      req.user.id,
      req.params.scanId
    );

    return res.status(200).json({
      success: true,
      count: findings.length,
      findings,
    });
  } catch (error) {
    next(error);
  }
};

// Update finding status
export const updateFinding = async (req, res, next) => {
  try {
    const finding = await updateFindingStatus(
      req.user.id,
      req.params.scanId,
      req.params.findingId,
      req.body.isResolved
    );

    return res.status(200).json({
      success: true,
      message: "Finding status updated successfully.",
      finding,
    });
  } catch (error) {
    next(error);
  }
};
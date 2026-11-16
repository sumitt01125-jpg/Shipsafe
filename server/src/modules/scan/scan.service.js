import prisma from "../../config/db.js";

import { analyzeSourceFiles } from "./security-analyzer.js";
import { detectArchitecture } from "./architecture-analyzer.js";
import { generateArchitectureGraph } from "./architecture-graph.js";
import { analyzeWithAI } from "./ai-analysis.service.js";

const GITHUB_API = "https://api.github.com";

const MAX_FILES = 100;
const MAX_FILE_SIZE = 100 * 1024;
const MAX_TOTAL_SIZE = 2 * 1024 * 1024;

const SKIP_DIRECTORIES = [
  "node_modules/",
  ".git/",
  "dist/",
  "build/",
  "coverage/",
];

const SKIP_FILES = [
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
];

const ALLOWED_EXTENSIONS = [
  "js", "jsx", "ts", "tsx", "json",
  "py", "php", "go", "java", "rb",
  "yaml", "yml",
];

const severityOrder = {
  CRITICAL: 1,
  HIGH: 2,
  MEDIUM: 3,
  LOW: 4,
};

const githubHeaders = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  ...(process.env.GITHUB_TOKEN && {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  }),
};

const githubRequest = async (url) => {
  const response = await fetch(url, {
    headers: githubHeaders,
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("GitHub repository or resource not found.");
    }

    if (response.status === 403 || response.status === 429) {
      throw new Error("GitHub API rate limit exceeded. Try again later.");
    }

    throw new Error(`GitHub request failed: ${response.status}`);
  }

  return response.json();
};

const isAllowedSourceFile = (path) => {
  const fileName = path.split("/").pop();
  const lowerPath = path.toLowerCase();

  if (
    fileName === ".env" ||
    fileName.startsWith(".env.") ||
    fileName === ".env.example"
  ) {
    return false;
  }

  if (SKIP_FILES.includes(fileName)) {
    return false;
  }

  if (SKIP_DIRECTORIES.some((directory) => lowerPath.includes(directory))) {
    return false;
  }

  const extension = fileName.split(".").pop()?.toLowerCase();

  return ALLOWED_EXTENSIONS.includes(extension);
};

const detectExposedEnvFiles = (tree) => {
  return tree
    .filter((item) => {
      if (item.type !== "blob") return false;

      const fileName = item.path.split("/").pop();

      return (
        fileName === ".env" ||
        /^\.env\.(?!example$|sample$|template$).+/i.test(fileName)
      );
    })
    .map((item) => ({
      title: "Environment File Committed",
      description:
        "An environment file appears to be committed to the repository. It may contain sensitive credentials.",
      recommendation:
        "Remove sensitive environment files from Git, add them to .gitignore, and rotate any exposed credentials.",
      severity: "HIGH",
      filePath: item.path,
      lineNumber: null,
    }));
};

const fetchRepositoryFiles = async (repository) => {
  const { fullName } = repository;

  const metadata = await githubRequest(
    `${GITHUB_API}/repos/${fullName}`
  );

  const defaultBranch = metadata.default_branch;

  const treeData = await githubRequest(
    `${GITHUB_API}/repos/${fullName}/git/trees/${encodeURIComponent(
      defaultBranch
    )}?recursive=1`
  );

  const tree = treeData.tree || [];

  const sourceFiles = tree.filter(
    (item) =>
      item.type === "blob" &&
      isAllowedSourceFile(item.path) &&
      item.size <= MAX_FILE_SIZE
  );

  const files = [];
  let totalSize = 0;

  for (const item of sourceFiles) {
    if (files.length >= MAX_FILES) break;

    if (totalSize + item.size > MAX_TOTAL_SIZE) break;

    try {
      const rawUrl = `https://raw.githubusercontent.com/${fullName}/${encodeURIComponent(
        defaultBranch
      )}/${item.path
        .split("/")
        .map(encodeURIComponent)
        .join("/")}`;

      const response = await fetch(rawUrl);

      if (!response.ok) continue;

      const content = await response.text();

      const contentSize = Buffer.byteLength(content, "utf8");

      if (contentSize > MAX_FILE_SIZE) continue;

      if (totalSize + contentSize > MAX_TOTAL_SIZE) break;

      files.push({
        path: item.path,
        content,
      });

      totalSize += contentSize;
    } catch (error) {
      console.error(
        `Unable to fetch ${item.path}:`,
        error.message
      );
    }
  }

  return {
    metadata,
    tree,
    files,
    totalFiles: tree.filter((item) => item.type === "blob").length,
    truncated: sourceFiles.length > files.length || treeData.truncated,
  };
};

// Create repository scan
export const analyzeRepository = async (
  userId,
  repositoryId,
  chatSessionId
) => {
  const repository = await prisma.repository.findFirst({
    where: {
      id: repositoryId,
      userId,
    },
  });

  if (!repository) {
    const error = new Error("Repository not found.");
    error.statusCode = 404;
    throw error;
  }

  // Verify chat session ownership
  if (chatSessionId) {
    const session = await prisma.chatSession.findFirst({
      where: {
        id: chatSessionId,
        userId,
      },
    });

    if (!session) {
      const error = new Error("Chat session not found.");
      error.statusCode = 404;
      throw error;
    }
  }

  const scan = await prisma.scan.create({
    data: {
      userId,
      repositoryId,
      chatSessionId: chatSessionId || null,
      status: "RUNNING",
    },
  });

  try {
    const {
      metadata,
      tree,
      files,
      totalFiles,
      truncated,
    } = await fetchRepositoryFiles(repository);

    // Security analysis
    const securityFindings = analyzeSourceFiles(files);

    const envFindings = detectExposedEnvFiles(tree);

    const findings = [
      ...securityFindings,
      ...envFindings,
    ];

    // Architecture analysis
    const architecture = detectArchitecture(files);

    // Architecture graph
    const architectureGraph = generateArchitectureGraph(
      architecture,
      {
        name: repository.name,
        fullName: repository.fullName,
      }
    );

    // AI analysis is an optional enhancement.
    // Deterministic findings remain the source of truth.
    let aiAnalysis = null;
    let aiAnalysisStatus = "SKIPPED";

    try {
      aiAnalysis = await analyzeWithAI({
        files,
        existingFindings: findings,
        architecture,
        architectureGraph,
      });

      aiAnalysisStatus = "COMPLETED";
    } catch (aiError) {
      aiAnalysisStatus = "FAILED";

      console.error(
        "ShipSafe AI analysis failed:",
        aiError.message
      );
    }

    const severityCounts = {
      CRITICAL: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
    };

    findings.forEach((finding) => {
      severityCounts[finding.severity]++;
    });

    // Save complete scan results
    await prisma.$transaction(async (tx) => {
      if (findings.length > 0) {
        await tx.finding.createMany({
          data: findings.map((finding) => ({
            scanId: scan.id,
            title: finding.title,
            description: finding.description,
            recommendation: finding.recommendation,
            severity: finding.severity,
            filePath: finding.filePath,
            lineNumber: finding.lineNumber,
          })),
        });
      }

      await tx.scan.update({
        where: {
          id: scan.id,
        },
        data: {
          status: "COMPLETED",
          totalIssues: findings.length,
          critical: severityCounts.CRITICAL,
          high: severityCounts.HIGH,
          medium: severityCounts.MEDIUM,
          low: severityCounts.LOW,

          // Persist deterministic architecture results.
          architecture,
          architectureGraph,

          // Persist AI report only when analysis succeeds.
          ...(aiAnalysis ? { aiAnalysis } : {}),
        },
      });

      await tx.repository.update({
        where: {
          id: repository.id,
        },
        data: {
          defaultBranch: metadata.default_branch,
          lastScannedAt: new Date(),
        },
      });
    });

    return {
      scanId: scan.id,
      status: "COMPLETED",

      repository: {
        name: repository.name,
        fullName: repository.fullName,
        defaultBranch: metadata.default_branch,
      },

      architecture,
      architectureGraph,

      aiAnalysis,
      aiAnalysisStatus,

      analyzedFiles: files.length,
      totalFiles,
      truncated,

      summary: {
        totalIssues: findings.length,
        ...severityCounts,
      },

      findings,
    };
  } catch (error) {
    await prisma.scan.update({
      where: {
        id: scan.id,
      },
      data: {
        status: "FAILED",
      },
    });

    throw error;
  }
};

// Get all scans of a user
export const getUserScans = async (userId) => {
  return prisma.scan.findMany({
    where: {
      userId,
    },
    include: {
      repository: {
        select: {
          name: true,
          fullName: true,
          githubUrl: true,
        },
      },
      _count: {
        select: {
          findings: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

// Get complete report of a particular scan
export const getScanById = async (userId, scanId) => {
  const scan = await prisma.scan.findFirst({
    where: {
      id: scanId,
      userId,
    },
    include: {
      repository: {
        select: {
          name: true,
          fullName: true,
          githubUrl: true,
          defaultBranch: true,
        },
      },
      findings: true,
    },
  });

  if (!scan) {
    const error = new Error("Scan not found.");
    error.statusCode = 404;
    throw error;
  }

  scan.findings.sort(
    (a, b) =>
      severityOrder[a.severity] - severityOrder[b.severity]
  );

  return scan;
};

// Get findings of a particular scan
export const getScanFindings = async (userId, scanId) => {
  const scan = await prisma.scan.findFirst({
    where: {
      id: scanId,
      userId,
    },
  });

  if (!scan) {
    const error = new Error("Scan not found.");
    error.statusCode = 404;
    throw error;
  }

  const findings = await prisma.finding.findMany({
    where: {
      scanId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return findings.sort(
    (a, b) =>
      severityOrder[a.severity] - severityOrder[b.severity]
  );
};

// Update finding resolved status
export const updateFindingStatus = async (
  userId,
  scanId,
  findingId,
  isResolved
) => {
  const finding = await prisma.finding.findFirst({
    where: {
      id: findingId,
      scanId,
      scan: {
        userId,
      },
    },
  });

  if (!finding) {
    const error = new Error("Finding not found.");
    error.statusCode = 404;
    throw error;
  }

  return prisma.finding.update({
    where: {
      id: findingId,
    },
    data: {
      isResolved,
    },
  });
};

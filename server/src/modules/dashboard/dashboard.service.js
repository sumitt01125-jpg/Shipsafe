import prisma from "../../config/db.js";

export const getDashboardStats = async (userId) => {
  const [
    totalRepositories,
    totalScans,
    completedScans,
    findings,
    recentScans,
  ] = await Promise.all([
    prisma.repository.count({
      where: { userId },
    }),

    prisma.scan.count({
      where: { userId },
    }),

    prisma.scan.count({
      where: {
        userId,
        status: "COMPLETED",
      },
    }),

    prisma.finding.groupBy({
      by: ["severity"],
      where: {
        scan: { userId },
      },
      _count: {
        id: true,
      },
    }),

    prisma.scan.findMany({
      where: { userId },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      include: {
        repository: {
          select: {
            name: true,
            fullName: true,
          },
        },
      },
    }),
  ]);

  const severityStats = {
    CRITICAL: 0,
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0,
  };

  findings.forEach((item) => {
    severityStats[item.severity] = item._count.id;
  });

  const totalFindings = Object.values(severityStats).reduce(
    (total, count) => total + count,
    0
  );

  return {
    overview: {
      totalRepositories,
      totalScans,
      completedScans,
      totalFindings,
    },

    security: severityStats,

    recentScans,
  };
};
const NODE_COLORS = {
  repository: "#a3e635",
  frontend: "#38bdf8",
  backend: "#a78bfa",
  database: "#f59e0b",
  cache: "#fb923c",
  language: "#94a3b8",
  tools: "#64748b",
};

export const generateArchitectureGraph = (
  architecture,
  repository
) => {
  const nodes = [];
  const edges = [];

  const addNode = (id, label, type, color) => {
    nodes.push({
      id,
      label,
      type,
      color,
    });
  };

  const addEdge = (source, target) => {
    edges.push({
      id: `${source}-${target}`,
      source,
      target,
    });
  };

  addNode(
    "repository",
    repository.fullName || repository.name || "Repository",
    "repository",
    NODE_COLORS.repository
  );

  const groups = {
    frontend: [
      "React",
      "Next.js",
      "Vue",
      "Angular",
      "Svelte",
    ],
    backend: [
      "Express",
      "NestJS",
      "Fastify",
    ],
    database: [
      "PostgreSQL",
      "MySQL",
      "MongoDB / Mongoose",
    ],
    cache: ["Redis"],
    tools: [
      "Vite",
      "Webpack",
      "Prisma",
    ],
  };

  const technologies = architecture.technologies || [];

  technologies.forEach((technology) => {
    let type = "tools";

    for (const [group, values] of Object.entries(groups)) {
      if (values.includes(technology)) {
        type = group;
        break;
      }
    }

    const id = `technology-${technology
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")}`;

    addNode(
      id,
      technology,
      type,
      NODE_COLORS[type]
    );

    addEdge("repository", id);
  });

  const languages = architecture.languages || [];

  languages.forEach((language) => {
    const id = `language-${language
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")}`;

    addNode(
      id,
      language,
      "language",
      NODE_COLORS.language
    );

    addEdge("repository", id);
  });

  return {
    nodes,
    edges,
    summary: {
      totalNodes: nodes.length,
      totalConnections: edges.length,
    },
  };
};
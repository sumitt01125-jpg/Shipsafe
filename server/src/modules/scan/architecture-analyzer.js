const detectArchitecture = (files) => {
  const paths = files.map((file) => file.path.toLowerCase());

  const packageFiles = files.filter((file) =>
    file.path.split("/").pop() === "package.json"
  );

  let dependencies = {};

  for (const packageFile of packageFiles) {
    try {
      const pkg = JSON.parse(packageFile.content);

      dependencies = {
        ...dependencies,
        ...(pkg.dependencies || {}),
        ...(pkg.devDependencies || {}),
      };
    } catch {
      // Ignore invalid package files.
    }
  }

  const has = (dependency) => Boolean(dependencies[dependency]);

  const technologies = new Set();

  // Frontend
  if (has("react")) technologies.add("React");
  if (has("next")) technologies.add("Next.js");
  if (has("vue")) technologies.add("Vue");
  if (has("@angular/core")) technologies.add("Angular");
  if (has("svelte")) technologies.add("Svelte");

  // Backend
  if (has("express")) technologies.add("Express");
  if (has("@nestjs/core")) technologies.add("NestJS");
  if (has("fastify")) technologies.add("Fastify");

  // Database and ORM
  if (has("prisma") || has("@prisma/client")) {
    technologies.add("Prisma");
  }

  if (has("mongoose")) {
    technologies.add("MongoDB / Mongoose");
  }

  if (has("pg")) technologies.add("PostgreSQL");
  if (has("mysql2")) technologies.add("MySQL");

  // Cache
  if (has("redis") || has("ioredis")) {
    technologies.add("Redis");
  }

  // Build tools
  if (has("vite")) technologies.add("Vite");
  if (has("webpack")) technologies.add("Webpack");

  // Languages
  const languages = new Set();

  const languageMap = {
    js: "JavaScript",
    jsx: "JavaScript",
    mjs: "JavaScript",
    cjs: "JavaScript",
    ts: "TypeScript",
    tsx: "TypeScript",
    py: "Python",
    java: "Java",
    go: "Go",
    php: "PHP",
    rb: "Ruby",
  };

  for (const path of paths) {
    const extension = path.split(".").pop();

    if (languageMap[extension]) {
      languages.add(languageMap[extension]);
    }
  }

  // Project type
  const frontendFrameworks = [
    "React",
    "Next.js",
    "Vue",
    "Angular",
    "Svelte",
  ];

  const backendFrameworks = [
    "Express",
    "NestJS",
    "Fastify",
  ];

  const detected = [...technologies];

  const hasFrontend = detected.some((item) =>
    frontendFrameworks.includes(item)
  );

  const hasBackend = detected.some((item) =>
    backendFrameworks.includes(item)
  );

  let projectType = "Unknown";

  if (hasFrontend && hasBackend) {
    projectType = "Full Stack";
  } else if (hasFrontend) {
    projectType = "Frontend";
  } else if (hasBackend) {
    projectType = "Backend";
  }

  return {
    projectType,
    languages: [...languages],
    technologies: detected,
    totalFiles: files.length,
  };
};

export { detectArchitecture };
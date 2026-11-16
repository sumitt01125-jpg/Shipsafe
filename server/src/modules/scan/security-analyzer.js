const SECRET_PATTERNS = [
  {
    title: "Hardcoded API Secret",
    regex: /(?:api[_-]?key|api[_-]?secret)\s*[:=]\s*["'][^"']{12,}["']/i,
    severity: "CRITICAL",
    description: "Possible hardcoded API secret detected.",
    recommendation: "Move secrets into environment variables and rotate exposed credentials.",
  },
  {
    title: "Exposed Database URL",
    regex: /(?:postgres|mysql|mongodb):\/\/[^:\s]+:[^@\s]+@/i,
    severity: "CRITICAL",
    description: "A database connection string containing credentials was detected.",
    recommendation: "Remove the credential from source code and rotate the database password.",
  },
  {
    title: "Hardcoded Token",
    regex: /(?:access[_-]?token|auth[_-]?token)\s*[:=]\s*["'][^"']{16,}["']/i,
    severity: "HIGH",
    description: "Possible hardcoded authentication token detected.",
    recommendation: "Store tokens securely in environment variables.",
  },
];

const CODE_PATTERNS = [
  {
    title: "Unsafe eval() Usage",
    regex: /\beval\s*\(/,
    severity: "HIGH",
    description: "eval() executes dynamically supplied JavaScript.",
    recommendation: "Avoid eval(). Use safer alternatives such as JSON.parse() where applicable.",
  },
  {
    title: "Dangerous Child Process Execution",
    regex: /child_process|exec\s*\(/,
    severity: "MEDIUM",
    description: "Potentially dangerous process execution detected.",
    recommendation: "Validate and sanitize all inputs before executing system commands.",
  },
  {
    title: "Insecure HTTP Connection",
    regex: /http:\/\/(?!localhost|127\.0\.0\.1)[^\s"'`]+/i,
    severity: "LOW",
    description: "An insecure HTTP URL was detected.",
    recommendation: "Use HTTPS wherever possible.",
  },
];

const SKIP_FILES = [
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  "bun.lockb",
];

export const analyzeSourceFiles = (files) => {
  const findings = [];

  for (const file of files) {
    if (SKIP_FILES.includes(file.path.split("/").pop())) {
      continue;
    }

    const lines = file.content.split("\n");

    lines.forEach((line, index) => {
      for (const rule of SECRET_PATTERNS) {
        if (rule.regex.test(line)) {
          findings.push({
            ...rule,
            filePath: file.path,
            lineNumber: index + 1,
          });
        }
      }

      for (const rule of CODE_PATTERNS) {
        if (rule.regex.test(line)) {
          findings.push({
            ...rule,
            filePath: file.path,
            lineNumber: index + 1,
          });
        }
      }
    });
  }

  return findings;
};
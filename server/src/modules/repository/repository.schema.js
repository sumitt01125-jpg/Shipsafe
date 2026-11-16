import { z } from "zod";

export const createRepositorySchema = z.object({
  githubUrl: z
    .string()
    .trim()
    .url("Invalid repository URL")
    .refine((value) => {
      try {
        const url = new URL(value);

        const parts = url.pathname
          .split("/")
          .filter(Boolean);

        return (
          url.hostname === "github.com" &&
          url.protocol === "https:" &&
          parts.length === 2 &&
          parts.every((part) => part !== "." && part !== "..")
        );
      } catch {
        return false;
      }
    }, "Enter a valid GitHub repository URL"),
});
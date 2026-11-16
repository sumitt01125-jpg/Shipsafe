import { z } from "zod";

export const createScanSchema = z.object({
  repositoryId: z.string().uuid("Invalid repository ID"),

  chatSessionId: z
    .string()
    .uuid("Invalid chat session ID")
    .optional(),
});

export const updateFindingSchema = z.object({
  isResolved: z.boolean(),
});
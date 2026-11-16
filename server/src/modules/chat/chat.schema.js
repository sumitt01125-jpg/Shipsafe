import { z } from "zod";

export const createChatSessionSchema = z.object({
  title: z.string().trim().min(1).max(150).optional(),
});

export const createChatMessageSchema = z.object({
  role: z.enum(["USER", "ASSISTANT"]),
  content: z.string().trim().min(1).max(20000),
  scanId: z.string().uuid().optional(),
});
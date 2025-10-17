import { z } from 'zod';

export const generateQuoteSchema = z.object({
  prompt: z.string().trim().min(1, { message: "Prompt is required" }).max(1000, { message: "Prompt is too long" }),
});

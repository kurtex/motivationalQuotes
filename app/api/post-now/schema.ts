import { z } from 'zod';

export const postNowSchema = z.object({
  prompt: z.string().trim().min(1, { message: "Prompt is required" }).max(1000, { message: "Prompt cannot exceed 1000 characters" }),
});

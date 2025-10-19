import { z } from 'zod';

export const threadsAuthSchema = z.object({
  code: z.string().min(1, { message: 'Authorization code is required' }),
});

import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  studentNumber: z.string().trim().min(1).max(64),
  password: z.string().min(8).max(200),
});

import { z } from 'zod';
import { userSchema } from '@/lib/schemas/user.ts';

export const activitySchema = z.object({
  user: userSchema.optional(),
  impersonator: userSchema.optional(),
  event: z.string(),
  ip: z.string().nullable(),
  data: z.object().nullable(),
  isApi: z.boolean(),
  created: z.date(),
});

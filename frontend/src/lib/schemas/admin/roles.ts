import { z } from 'zod';
import { nullableString } from '@/lib/transformers.ts';

export const adminRoleSchema = z.object({
  name: z.string().min(3).max(255),
  description: z.preprocess(nullableString, z.string().max(1024).nullable()),
  requireTwoFactor: z.boolean(),
  adminPermissions: z.array(z.string()),
  serverPermissions: z.array(z.string()),
});

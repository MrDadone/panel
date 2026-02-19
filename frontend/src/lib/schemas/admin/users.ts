import { z } from 'zod';
import { nullableString } from '@/lib/transformers.ts';

export const adminUserSchema = z.object({
  username: z.string(),
  email: z.email(),
  nameFirst: z.string(),
  nameLast: z.string(),
  password: z.preprocess(nullableString, z.string().nullable()),
  admin: z.boolean(),
  language: z.string(),
  roleUuid: z.uuid().nullable(),
});

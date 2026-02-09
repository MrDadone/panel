import { z } from 'zod';

export const adminUserSchema = z.object({
  username: z.string(),
  email: z.email(),
  nameFirst: z.string(),
  nameLast: z.string(),
  password: z.string().nullable(),
  admin: z.boolean(),
  language: z.string(),
  roleUuid: z.uuid().nullable(),
});

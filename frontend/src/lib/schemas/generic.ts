import { z } from 'zod';

export const databaseType = z.enum(['mysql', 'postgres']);

export const databaseHostSchema = z.object({
  uuid: z.string(),
  name: z.string(),
  host: z.string().nullable(),
  port: z.number(),
  type: databaseType,
});

export const oAuthProviderSchema = z.object({
  uuid: z.string(),
  name: z.string(),
  linkViewable: z.boolean(),
  userManageable: z.boolean(),
});

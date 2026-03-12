import { z } from 'zod';
import { oAuthProviderSchema } from '@/lib/schemas/generic.ts';
import { roleSchema, userToastPosition } from '@/lib/schemas/user.ts';
import { nullableString } from '@/lib/transformers.ts';

export const adminUserSchema = z.object({
  uuid: z.string(),
  username: z.string(),
  email: z.email(),
  nameFirst: z.string(),
  nameLast: z.string(),
  password: z.preprocess(nullableString, z.string().nullable()),
  admin: z.boolean(),
  language: z.string(),
  role: roleSchema,
  created: z.date(),
});

export const adminFullUserSchema = adminUserSchema.extend({
  avatar: z.string().optional(),
  totpEnabled: z.boolean(),
  totpLastUsed: z.date().nullable(),
  requireTwoFactor: z.boolean(),
  toastPosition: userToastPosition,
  startOnGroupedServers: z.boolean(),
  hasPassword: z.boolean(),
});

export const adminUserUpdateSchema = adminUserSchema
  .omit({
    uuid: true,
    role: true,
    created: true,
  })
  .extend({
    roleUuid: z.string().nullable(),
  });

export const adminUserOAuthLinkSchema = z.object({
  uuid: z.string(),
  oauthProvider: oAuthProviderSchema,
  identifier: z.string(),
  lastUsed: z.date().nullable(),
  created: z.date(),
});

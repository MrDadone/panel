import { z } from 'zod';

export const userApiKeySchema = z.object({
  uuid: z.string(),
  name: z.string().min(3).max(31),
  keyStart: z.string(),
  allowedIps: z.array(z.ipv4().or(z.ipv6()).or(z.cidrv4()).or(z.cidrv6())),
  userPermissions: z.array(z.string()),
  serverPermissions: z.array(z.string()),
  adminPermissions: z.array(z.string()),
  expires: z.date().nullable().optional(),
  lastUsed: z.date(),
  created: z.date(),
});

export const userApiKeyUpdateSchema = userApiKeySchema.omit({
  uuid: true,
  keyStart: true,
  lastUsed: true,
  created: true,
});

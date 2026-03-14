import { z } from 'zod';

export const userSecurityKeySchema = z.object({
  uuid: z.string(),
  name: z.string(),
  credentialId: z.string(),
  lastUsed: z.date().nullable(),
  created: z.date(),
});

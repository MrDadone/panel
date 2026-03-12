import { z } from 'zod';

export const userSshKeySchema = z.object({
  uuid: z.string(),
  name: z.string(),
  fingerprint: z.string(),
  created: z.date(),
});

import { z } from 'zod';

export const storageAssetSchema = z.object({
  name: z.string(),
  url: z.string(),
  size: z.number(),
  created: z.date(),
});

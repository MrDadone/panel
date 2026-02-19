import { z } from 'zod';
import { nullableString } from '@/lib/transformers.ts';

export const adminLocationSchema = z.object({
  name: z.string().min(3).max(255),
  description: z.preprocess(nullableString, z.string().max(1024).nullable()),
  backupConfigurationUuid: z.uuid().nullable(),
});

import { z } from 'zod';
import { nullableString } from '@/lib/transformers.ts';

export const adminEggRepositorySchema = z.object({
  uuid: z.string(),
  name: z.string().min(3).max(255),
  description: z.preprocess(nullableString, z.string().max(1024).nullable()),
  gitRepository: z.url(),
  created: z.date(),
});

export const adminEggRepositoryUpdateSchema = adminEggRepositorySchema.omit({
  uuid: true,
  created: true,
});

export const adminEggRepositoryEggSchema = z.object({
  uuid: z.string(),
  path: z.string(),
  author: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  exportedEgg: z.object(),
});

export const adminEggEggRepositoryEggSchema = adminEggRepositoryEggSchema.extend({
  eggRepository: z.lazy(() => adminEggRepositorySchema),
});

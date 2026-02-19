import { z } from 'zod';
import { nullableString } from '@/lib/transformers.ts';

export const adminNodeAllocationsSchema = z.object({
  ip: z.string(),
  ipAlias: z.string().min(1).max(255).nullable(),
  ports: z.array(z.string()),
});

export const adminNodeSchema = z.object({
  locationUuid: z.uuid(),
  backupConfigurationUuid: z.uuid().nullable(),
  name: z.string().min(3).max(255),
  deploymentEnabled: z.boolean(),
  maintenanceEnabled: z.boolean(),
  description: z.preprocess(nullableString, z.string().max(1024).nullable()),
  publicUrl: z.preprocess(nullableString, z.url().min(3).max(255).nullable()),
  url: z.url().min(3).max(255),
  sftpHost: z.preprocess(nullableString, z.string().min(3).max(255).nullable()),
  sftpPort: z.number().min(0).max(65535),
  memory: z.number().min(0),
  disk: z.number().min(0),
});

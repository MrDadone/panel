import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { adminBackupConfigurationUpdateSchema } from '@/lib/schemas/admin/backupConfigurations.ts';
import { transformKeysToSnakeCase } from '@/lib/transformers.ts';

export default async (
  backupConfigUuid: string,
  data: z.infer<typeof adminBackupConfigurationUpdateSchema>,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .patch(`/api/admin/backup-configurations/${backupConfigUuid}`, {
        ...transformKeysToSnakeCase(data),
        backup_configs: data.backupConfigs
          ? {
              ...transformKeysToSnakeCase(data.backupConfigs),
              restic: data.backupConfigs.restic
                ? {
                    ...transformKeysToSnakeCase(data.backupConfigs.restic),
                    environment: data.backupConfigs.restic.environment,
                  }
                : null,
            }
          : null,
      })
      .then(() => resolve())
      .catch(reject);
  });
};

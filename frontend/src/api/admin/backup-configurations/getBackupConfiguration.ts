import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { adminBackupConfigurationSchema } from '@/lib/schemas/admin/backupConfigurations.ts';

export default async (backupConfigUuid: string): Promise<z.infer<typeof adminBackupConfigurationSchema>> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .get(`/api/admin/backup-configurations/${backupConfigUuid}`)
      .then(({ data }) => resolve(data.backupConfiguration))
      .catch(reject);
  });
};

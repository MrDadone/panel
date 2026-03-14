import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { adminBackupConfigurationSchema } from '@/lib/schemas/admin/backupConfigurations.ts';

export default async (
  page: number,
  search?: string,
): Promise<Pagination<z.infer<typeof adminBackupConfigurationSchema>>> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .get('/api/admin/backup-configurations', {
        params: { page, search },
      })
      .then(({ data }) => resolve(data.backupConfigurations))
      .catch(reject);
  });
};

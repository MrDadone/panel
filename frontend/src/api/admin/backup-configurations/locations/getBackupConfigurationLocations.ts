import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { adminLocationSchema } from '@/lib/schemas/admin/locations.ts';

export default async (
  backupConfigUuid: string,
  page: number,
  search?: string,
): Promise<Pagination<z.infer<typeof adminLocationSchema>>> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .get(`/api/admin/backup-configurations/${backupConfigUuid}/locations`, {
        params: { page, search },
      })
      .then(({ data }) => resolve(data.locations))
      .catch(reject);
  });
};

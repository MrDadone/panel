import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { adminServerSchema } from '@/lib/schemas/admin/servers.ts';

export default async (
  backupConfigUuid: string,
  page: number,
  search?: string,
): Promise<Pagination<z.infer<typeof adminServerSchema>>> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .get(`/api/admin/backup-configurations/${backupConfigUuid}/servers`, {
        params: { page, search },
      })
      .then(({ data }) => resolve(data.servers))
      .catch(reject);
  });
};

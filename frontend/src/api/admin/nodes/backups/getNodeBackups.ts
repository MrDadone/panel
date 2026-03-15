import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { adminServerBackupSchema } from '@/lib/schemas/admin/servers.ts';

export default async (
  nodeUuid: string,
  page: number,
  search?: string,
  detached?: boolean,
): Promise<Pagination<z.infer<typeof adminServerBackupSchema>>> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .get(`/api/admin/nodes/${nodeUuid}/backups`, {
        params: { page, search, detached },
      })
      .then(({ data }) => resolve(data.backups))
      .catch(reject);
  });
};

import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { adminServerSchema } from '@/lib/schemas/admin/servers.ts';

export default async (
  nestUuid: string,
  eggUuid: string,
  page: number,
  search?: string,
): Promise<Pagination<z.infer<typeof adminServerSchema>>> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .get(`/api/admin/nests/${nestUuid}/eggs/${eggUuid}/servers`, {
        params: { page, search },
      })
      .then(({ data }) => resolve(data.servers))
      .catch(reject);
  });
};

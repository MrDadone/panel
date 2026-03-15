import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { adminServerSchema } from '@/lib/schemas/admin/servers.ts';

export default async (
  userUuid: string,
  page: number,
  search?: string,
  owned?: boolean,
): Promise<Pagination<z.infer<typeof adminServerSchema>>> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .get(`/api/admin/users/${userUuid}/servers`, {
        params: { page, search, owned },
      })
      .then(({ data }) => resolve(data.servers))
      .catch(reject);
  });
};

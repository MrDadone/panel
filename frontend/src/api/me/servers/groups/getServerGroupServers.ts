import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { serverSchema } from '@/lib/schemas/server/server.ts';

export default async (
  serverGroupUuid: string,
  page: number,
  search?: string,
): Promise<Pagination<z.infer<typeof serverSchema>>> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .get(`/api/client/servers/groups/${serverGroupUuid}`, { params: { page, search } })
      .then(({ data }) => resolve(data.servers))
      .catch(reject);
  });
};

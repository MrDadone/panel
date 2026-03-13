import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { adminServerSchema } from '@/lib/schemas/admin/servers.ts';

export default async (
  nodeUuid: string,
  page: number,
  search?: string,
): Promise<{ servers: Pagination<z.infer<typeof adminServerSchema>>; transfers: Record<string, TransferProgress> }> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .get(`/api/admin/nodes/${nodeUuid}/servers/transfers`, {
        params: { page, search },
      })
      .then(({ data }) => resolve(data))
      .catch(reject);
  });
};

import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { adminNodeMountSchema } from '@/lib/schemas/admin/nodes.ts';

export default async (
  nodeUuid: string,
  page: number,
  search?: string,
): Promise<Pagination<z.infer<typeof adminNodeMountSchema>>> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .get(`/api/admin/nodes/${nodeUuid}/mounts`, {
        params: { page, search },
      })
      .then(({ data }) => resolve(data.mounts))
      .catch(reject);
  });
};

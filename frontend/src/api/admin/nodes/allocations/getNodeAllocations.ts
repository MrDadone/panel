import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { adminNodeAllocationSchema } from '@/lib/schemas/admin/nodes.ts';

export default async (
  nodeUuid: string,
  page: number,
  search?: string,
): Promise<Pagination<z.infer<typeof adminNodeAllocationSchema>>> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .get(`/api/admin/nodes/${nodeUuid}/allocations`, {
        params: { page, per_page: 100, search },
      })
      .then(({ data }) => resolve(data.allocations))
      .catch(reject);
  });
};

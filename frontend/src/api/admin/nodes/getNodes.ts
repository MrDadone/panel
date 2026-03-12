import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { adminNodeSchema } from '@/lib/schemas/admin/nodes.ts';

export default async (page: number, search?: string): Promise<Pagination<z.infer<typeof adminNodeSchema>>> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .get('/api/admin/nodes', {
        params: { page, search },
      })
      .then(({ data }) => resolve(data.nodes))
      .catch(reject);
  });
};

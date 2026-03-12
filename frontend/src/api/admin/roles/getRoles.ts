import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { roleSchema } from '@/lib/schemas/user.ts';

export default async (page: number, search?: string): Promise<Pagination<z.infer<typeof roleSchema>>> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .get('/api/admin/roles', {
        params: { page, search },
      })
      .then(({ data }) => resolve(data.roles))
      .catch(reject);
  });
};

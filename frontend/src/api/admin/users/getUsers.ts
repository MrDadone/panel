import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { adminFullUserSchema } from '@/lib/schemas/admin/users.ts';

export default async (page: number, search?: string): Promise<Pagination<z.infer<typeof adminFullUserSchema>>> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .get('/api/admin/users', {
        params: { page, search },
      })
      .then(({ data }) => resolve(data.users))
      .catch(reject);
  });
};

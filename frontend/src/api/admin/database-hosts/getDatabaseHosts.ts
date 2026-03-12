import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { adminDatabaseHostSchema } from '@/lib/schemas/admin/databaseHosts.ts';

export default async (page: number, search?: string): Promise<Pagination<z.infer<typeof adminDatabaseHostSchema>>> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .get('/api/admin/database-hosts', {
        params: { page, search },
      })
      .then(({ data }) => resolve(data.databaseHosts))
      .catch(reject);
  });
};

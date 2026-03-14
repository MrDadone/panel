import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { adminDatabaseHostCreateSchema, adminDatabaseHostSchema } from '@/lib/schemas/admin/databaseHosts.ts';
import { transformKeysToSnakeCase } from '@/lib/transformers.ts';

export default async (
  data: z.infer<typeof adminDatabaseHostCreateSchema>,
): Promise<z.infer<typeof adminDatabaseHostSchema>> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .post('/api/admin/database-hosts', transformKeysToSnakeCase(data))
      .then(({ data }) => resolve(data.databaseHost))
      .catch(reject);
  });
};

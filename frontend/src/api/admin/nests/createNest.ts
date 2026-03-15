import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { adminNestSchema, adminNestUpdateSchema } from '@/lib/schemas/admin/nests.ts';
import { transformKeysToSnakeCase } from '@/lib/transformers.ts';

export default async (data: z.infer<typeof adminNestUpdateSchema>): Promise<z.infer<typeof adminNestSchema>> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .post('/api/admin/nests', transformKeysToSnakeCase(data))
      .then(({ data }) => resolve(data.nest))
      .catch(reject);
  });
};

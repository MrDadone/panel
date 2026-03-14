import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { adminFullUserSchema, adminUserUpdateSchema } from '@/lib/schemas/admin/users.ts';
import { transformKeysToSnakeCase } from '@/lib/transformers.ts';

export default async (data: z.infer<typeof adminUserUpdateSchema>): Promise<z.infer<typeof adminFullUserSchema>> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .post('/api/admin/users', transformKeysToSnakeCase(data))
      .then(({ data }) => resolve(data.user))
      .catch(reject);
  });
};

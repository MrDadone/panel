import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { adminUserSchema } from '@/lib/schemas/admin/users.ts';
import { transformKeysToSnakeCase } from '@/lib/transformers.ts';

export default async (userUuid: string, data: z.infer<typeof adminUserSchema>): Promise<void> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .patch(`/api/admin/users/${userUuid}`, transformKeysToSnakeCase(data))
      .then(() => resolve())
      .catch(reject);
  });
};

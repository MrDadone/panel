import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { adminUserUpdateSchema } from '@/lib/schemas/admin/users.ts';
import { transformKeysToSnakeCase } from '@/lib/transformers.ts';

export default async (userUuid: string, data: z.infer<typeof adminUserUpdateSchema>): Promise<void> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .patch(`/api/admin/users/${userUuid}`, transformKeysToSnakeCase(data))
      .then(() => resolve())
      .catch(reject);
  });
};

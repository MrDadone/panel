import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { adminFullUserSchema } from '@/lib/schemas/admin/users.ts';

export default async (userUuid: string): Promise<z.infer<typeof adminFullUserSchema>> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .get(`/api/admin/users/${userUuid}`)
      .then(({ data }) => resolve(data.user))
      .catch(reject);
  });
};

import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { apiPermissionsSchema } from '@/lib/schemas/generic.ts';

export default async (): Promise<z.infer<typeof apiPermissionsSchema>> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .get('/api/client/permissions')
      .then(({ data }) => resolve(data))
      .catch(reject);
  });
};

import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { roleSchema } from '@/lib/schemas/user.ts';

export default async (roleUuid: string): Promise<z.infer<typeof roleSchema>> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .get(`/api/admin/roles/${roleUuid}`)
      .then(({ data }) => resolve(data.role))
      .catch(reject);
  });
};

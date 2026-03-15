import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { adminMountSchema } from '@/lib/schemas/admin/mounts.ts';

export default async (mountUuid: string): Promise<z.infer<typeof adminMountSchema>> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .get(`/api/admin/mounts/${mountUuid}`)
      .then(({ data }) => resolve(data.mount))
      .catch(reject);
  });
};

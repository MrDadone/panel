import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { serverMountSchema } from '@/lib/schemas/server/mounts.ts';

export default async (uuid: string): Promise<Pagination<z.infer<typeof serverMountSchema>>> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .get(`/api/client/servers/${uuid}/mounts`)
      .then(({ data }) => resolve(data.mounts))
      .catch(reject);
  });
};

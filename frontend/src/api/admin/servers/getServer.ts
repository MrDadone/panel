import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { adminServerSchema } from '@/lib/schemas/admin/servers.ts';

export default async (serverUuid: string): Promise<z.infer<typeof adminServerSchema>> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .get(`/api/admin/servers/${serverUuid}`)
      .then(({ data }) => resolve(data.server))
      .catch(reject);
  });
};

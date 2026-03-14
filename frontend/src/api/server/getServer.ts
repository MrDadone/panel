import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { serverSchema } from '@/lib/schemas/server/server.ts';

export default async (uuid: string): Promise<z.infer<typeof serverSchema>> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .get(`/api/client/servers/${uuid}`)
      .then(({ data }) => resolve(data.server))
      .catch(reject);
  });
};

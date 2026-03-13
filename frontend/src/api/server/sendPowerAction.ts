import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { serverPowerAction } from '@/lib/schemas/server/server.ts';

export default async (uuid: string, action: z.infer<typeof serverPowerAction>): Promise<void> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .post(`/api/client/servers/${uuid}/power`, {
        action,
      })
      .then(() => resolve())
      .catch(reject);
  });
};

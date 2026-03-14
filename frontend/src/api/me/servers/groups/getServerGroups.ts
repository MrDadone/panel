import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { userServerGroupSchema } from '@/lib/schemas/user.ts';

export default async (): Promise<z.infer<typeof userServerGroupSchema>[]> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .get('/api/client/servers/groups')
      .then(({ data }) => resolve(data.serverGroups))
      .catch(reject);
  });
};

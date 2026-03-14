import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { userServerGroupSchema } from '@/lib/schemas/user.ts';
import { transformKeysToSnakeCase } from '@/lib/transformers.ts';

interface Data {
  name: string;
  serverOrder: string[];
}

export default async (data: Data): Promise<z.infer<typeof userServerGroupSchema>> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .post('/api/client/servers/groups', transformKeysToSnakeCase(data))
      .then(({ data }) => resolve(data.serverGroup))
      .catch(reject);
  });
};

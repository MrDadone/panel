import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { serverEnvVariableSchema } from '@/lib/schemas/server/startup.ts';
import { transformKeysToSnakeCase } from '@/lib/transformers.ts';

export default async (serverUuid: string, variables: z.infer<typeof serverEnvVariableSchema>[]): Promise<void> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .put(`/api/admin/servers/${serverUuid}/variables`, {
        variables: transformKeysToSnakeCase(variables),
      })
      .then(() => resolve())
      .catch(reject);
  });
};

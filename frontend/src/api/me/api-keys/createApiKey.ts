import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { userApiKeySchema, userApiKeyUpdateSchema } from '@/lib/schemas/user/apiKeys.ts';
import { transformKeysToSnakeCase } from '@/lib/transformers.ts';

interface Response {
  apiKey: z.infer<typeof userApiKeySchema>;
  key: string;
}

export default async (data: z.infer<typeof userApiKeyUpdateSchema>): Promise<Response> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .post('/api/client/account/api-keys', {
        ...transformKeysToSnakeCase(data),
        expires: data.expires ? data.expires.toISOString() : null,
      })
      .then(({ data }) => resolve(data))
      .catch(reject);
  });
};

import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { userApiKeyUpdateSchema } from '@/lib/schemas/user/apiKeys.ts';
import { transformKeysToSnakeCase } from '@/lib/transformers.ts';

export default async (apiKeyUuid: string, data: z.infer<typeof userApiKeyUpdateSchema>): Promise<void> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .patch(`/api/client/account/api-keys/${apiKeyUuid}`, {
        ...transformKeysToSnakeCase(data),
        expires: data.expires ? data.expires.toISOString() : null,
      })
      .then(() => resolve())
      .catch(reject);
  });
};

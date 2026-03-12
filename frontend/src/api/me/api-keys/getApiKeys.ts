import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { userApiKeySchema } from '@/lib/schemas/user/apiKeys.ts';

export default async (page: number, search?: string): Promise<Pagination<z.infer<typeof userApiKeySchema>>> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .get('/api/client/account/api-keys', {
        params: { page, search },
      })
      .then(({ data }) => resolve(data.apiKeys))
      .catch(reject);
  });
};

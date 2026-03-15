import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { adminOAuthProviderSchema } from '@/lib/schemas/admin/oauthProviders.ts';

export default async (page: number, search?: string): Promise<Pagination<z.infer<typeof adminOAuthProviderSchema>>> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .get('/api/admin/oauth-providers', {
        params: { page, search },
      })
      .then(({ data }) => resolve(data.oauthProviders))
      .catch(reject);
  });
};

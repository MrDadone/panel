import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { adminOAuthProviderSchema, adminOAuthProviderUpdateSchema } from '@/lib/schemas/admin/oauthProviders.ts';
import { transformKeysToSnakeCase } from '@/lib/transformers.ts';

export default async (
  data: z.infer<typeof adminOAuthProviderUpdateSchema>,
): Promise<z.infer<typeof adminOAuthProviderSchema>> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .post('/api/admin/oauth-providers', transformKeysToSnakeCase(data))
      .then(({ data }) => resolve(data.oauthProvider))
      .catch(reject);
  });
};

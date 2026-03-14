import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { adminOAuthProviderSchema } from '@/lib/schemas/admin/oauthProviders.ts';

export default async (oauthProviderUuid: string): Promise<z.infer<typeof adminOAuthProviderSchema>> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .get(`/api/admin/oauth-providers/${oauthProviderUuid}`)
      .then(({ data }) => resolve(data.oauthProvider))
      .catch(reject);
  });
};

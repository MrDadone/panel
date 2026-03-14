import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { oAuthProviderSchema } from '@/lib/schemas/generic.ts';

export default async (): Promise<z.infer<typeof oAuthProviderSchema>[]> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .get('/api/auth/oauth')
      .then(({ data }) => resolve(data.oauthProviders))
      .catch(reject);
  });
};

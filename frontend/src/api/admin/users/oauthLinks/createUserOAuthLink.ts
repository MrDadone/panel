import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { adminUserOAuthLinkSchema } from '@/lib/schemas/admin/users.ts';

export default async (
  userUuid: string,
  oauthProviderUuid: string,
  identifier: string,
): Promise<z.infer<typeof adminUserOAuthLinkSchema>> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .post(`/api/admin/users/${userUuid}/oauth-links`, {
        oauth_provider_uuid: oauthProviderUuid,
        identifier,
      })
      .then(({ data }) => resolve(data.oauthLink))
      .catch(reject);
  });
};

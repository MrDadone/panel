import { z } from 'zod';
import { axiosInstance, getPaginationSet } from '@/api/axios.ts';
import { userSecurityKeySchema } from '@/lib/schemas/user/securityKeys.ts';

export default async (page: number, search?: string): Promise<Pagination<z.infer<typeof userSecurityKeySchema>>> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .get('/api/client/account/security-keys', {
        params: { page, search },
      })
      .then(({ data }) =>
        resolve({
          ...getPaginationSet(data.securityKeys),
          data: data.securityKeys.data || [],
        }),
      )
      .catch(reject);
  });
};

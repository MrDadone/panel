import { z } from 'zod';
import { axiosInstance, getPaginationSet } from '@/api/axios.ts';
import { userSshKeySchema } from '@/lib/schemas/user/sshKeys.ts';

export default async (page: number, search?: string): Promise<Pagination<z.infer<typeof userSshKeySchema>>> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .get('/api/client/account/ssh-keys', {
        params: { page, search },
      })
      .then(({ data }) =>
        resolve({
          ...getPaginationSet(data.sshKeys),
          data: data.sshKeys.data || [],
        }),
      )
      .catch(reject);
  });
};

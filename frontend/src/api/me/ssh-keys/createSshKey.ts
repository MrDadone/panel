import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { userSshKeySchema } from '@/lib/schemas/user/sshKeys.ts';
import { transformKeysToSnakeCase } from '@/lib/transformers.ts';

interface Data {
  name: string;
  publicKey: string;
}

export default async (data: Data): Promise<z.infer<typeof userSshKeySchema>> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .post('/api/client/account/ssh-keys', transformKeysToSnakeCase(data))
      .then(({ data }) => resolve(data.sshKey))
      .catch(reject);
  });
};

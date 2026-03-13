import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { serverSubuserSchema } from '@/lib/schemas/server/subusers.ts';

interface Data {
  email: string;
  permissions: string[];
  ignoredFiles: string[];
  captcha: string | null;
}

export default async (uuid: string, data: Data): Promise<z.infer<typeof serverSubuserSchema>> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .post(`/api/client/servers/${uuid}/subusers`, {
        email: data.email,
        permissions: data.permissions,
        ignored_files: data.ignoredFiles,
        captcha: data.captcha,
      })
      .then(({ data }) => resolve(data.subuser))
      .catch(reject);
  });
};

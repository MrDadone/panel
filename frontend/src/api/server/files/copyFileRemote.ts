import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { serverFilesCopyRemoteSchema } from '@/lib/schemas/server/files.ts';
import { transformKeysToSnakeCase } from '@/lib/transformers.ts';

type Data = z.infer<typeof serverFilesCopyRemoteSchema> & {
  root: string;
  files: string[];
};

export default async (uuid: string, data: Data): Promise<string> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .post(`/api/client/servers/${uuid}/files/copy-remote`, transformKeysToSnakeCase(data))
      .then(({ data }) => resolve(data.identifier))
      .catch(reject);
  });
};

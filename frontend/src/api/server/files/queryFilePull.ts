import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { serverFilesPullQueryResultSchema } from '@/lib/schemas/server/files.ts';

export default async (uuid: string, url: string): Promise<z.infer<typeof serverFilesPullQueryResultSchema>> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .post(`/api/client/servers/${uuid}/files/pull/query`, { url })
      .then(({ data }) => resolve(data.queryResult))
      .catch(reject);
  });
};

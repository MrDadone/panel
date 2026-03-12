import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { adminServerMountSchema } from '@/lib/schemas/admin/servers.ts';
import { transformKeysToSnakeCase } from '@/lib/transformers.ts';

interface Data {
  mountUuid: string;
}

export default async (serverUuid: string, data: Data): Promise<z.infer<typeof adminServerMountSchema>> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .post(`/api/admin/servers/${serverUuid}/mounts`, transformKeysToSnakeCase(data))
      .then(({ data }) => resolve(data))
      .catch(reject);
  });
};

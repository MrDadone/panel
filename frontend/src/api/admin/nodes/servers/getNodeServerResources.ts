import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { serverResourceUsageSchema } from '@/lib/schemas/server/server.ts';

export default async (nodeUuid: string): Promise<Record<string, z.infer<typeof serverResourceUsageSchema>>> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .get(`/api/admin/nodes/${nodeUuid}/servers/resources`)
      .then(({ data }) => resolve(data.resources))
      .catch(reject);
  });
};

import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { serverAllocationSchema } from '@/lib/schemas/server/allocations.ts';
import { transformKeysToSnakeCase } from '@/lib/transformers.ts';

interface Data {
  allocationUuid: string;
}

export default async (serverUuid: string, data: Data): Promise<z.infer<typeof serverAllocationSchema>> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .post(`/api/admin/servers/${serverUuid}/allocations`, transformKeysToSnakeCase(data))
      .then(({ data }) => resolve(data.allocation))
      .catch(reject);
  });
};

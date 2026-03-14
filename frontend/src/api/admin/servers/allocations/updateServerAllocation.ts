import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { serverAllocationSchema } from '@/lib/schemas/server/allocations.ts';
import { transformKeysToSnakeCase } from '@/lib/transformers.ts';

interface Data {
  notes?: string;
  primary?: boolean;
}

export default async (
  serverUuid: string,
  allocationUuid: string,
  data: Data,
): Promise<z.infer<typeof serverAllocationSchema>> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .patch(`/api/admin/servers/${serverUuid}/allocations/${allocationUuid}`, transformKeysToSnakeCase(data))
      .then(({ data }) => resolve(data.allocation))
      .catch(reject);
  });
};

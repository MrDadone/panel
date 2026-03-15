import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { serverAllocationSchema } from '@/lib/schemas/server/allocations.ts';

export default async (uuid: string): Promise<z.infer<typeof serverAllocationSchema>> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .post(`/api/client/servers/${uuid}/allocations`)
      .then(({ data }) => resolve(data.allocation))
      .catch(reject);
  });
};

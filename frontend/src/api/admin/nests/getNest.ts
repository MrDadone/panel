import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { adminNestSchema } from '@/lib/schemas/admin/nests.ts';

export default async (nestUuid: string): Promise<z.infer<typeof adminNestSchema>> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .get(`/api/admin/nests/${nestUuid}`)
      .then(({ data }) => resolve(data.nest))
      .catch(reject);
  });
};

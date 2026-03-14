import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { adminEggSchema } from '@/lib/schemas/admin/eggs.ts';

export default async (nestUuid: string, data: object): Promise<z.infer<typeof adminEggSchema>> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .post(`/api/admin/nests/${nestUuid}/eggs/import`, data)
      .then(({ data }) => resolve(data.egg))
      .catch(reject);
  });
};

import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { adminEggSchema } from '@/lib/schemas/admin/eggs.ts';

export default async (nestUuid: string, eggUuid: string): Promise<z.infer<typeof adminEggSchema>> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .get(`/api/admin/nests/${nestUuid}/eggs/${eggUuid}`)
      .then(({ data }) => resolve(data.egg))
      .catch(reject);
  });
};

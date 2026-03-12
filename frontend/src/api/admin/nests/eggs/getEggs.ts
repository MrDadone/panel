import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { adminEggSchema } from '@/lib/schemas/admin/eggs.ts';

export default async (
  nestUuid: string,
  page: number,
  search?: string,
): Promise<Pagination<z.infer<typeof adminEggSchema>>> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .get(`/api/admin/nests/${nestUuid}/eggs`, {
        params: { page, search },
      })
      .then(({ data }) => resolve(data.eggs))
      .catch(reject);
  });
};

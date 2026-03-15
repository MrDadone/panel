import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { storageAssetSchema } from '@/lib/schemas/admin/assets.ts';

export default async (page: number): Promise<Pagination<z.infer<typeof storageAssetSchema>>> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .get('/api/admin/assets', {
        params: { page, per_page: 100 },
      })
      .then(({ data }) => resolve(data.assets))
      .catch(reject);
  });
};

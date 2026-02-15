import { axiosInstance } from '@/api/axios.ts';

export default async (page: number): Promise<ResponseMeta<StorageAsset>> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .get('/api/admin/assets', {
        params: { page, per_page: 100 },
      })
      .then(({ data }) => resolve(data.assets))
      .catch(reject);
  });
};

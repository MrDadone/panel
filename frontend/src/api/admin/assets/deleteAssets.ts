import { axiosInstance } from '@/api/axios.ts';

export default async (assetNames: string[]): Promise<{ deleted: number }> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .post('/api/admin/assets/delete', { names: assetNames })
      .then(({ data }) => resolve(data))
      .catch(reject);
  });
};

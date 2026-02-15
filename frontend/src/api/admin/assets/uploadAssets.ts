import { axiosInstance } from '@/api/axios.ts';

export default async (form: FormData): Promise<StorageAsset[]> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .putForm('/api/admin/assets', form)
      .then(({ data }) => resolve(data.assets))
      .catch(reject);
  });
};

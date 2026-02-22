import { AxiosRequestConfig } from 'axios';
import { axiosInstance } from '@/api/axios.ts';

export default async (form: FormData, config: AxiosRequestConfig): Promise<StorageAsset[]> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .putForm('/api/admin/assets', form, config)
      .then(({ data }) => resolve(data.assets))
      .catch(reject);
  });
};

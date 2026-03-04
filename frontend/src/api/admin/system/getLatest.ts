import { axiosInstance } from '@/api/axios.ts';

export default async (): Promise<Record<'panel' | 'wings' | 'fusequota', string>> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .get('/api/admin/system/latest')
      .then(({ data }) => resolve(data.versions))
      .catch(reject);
  });
};

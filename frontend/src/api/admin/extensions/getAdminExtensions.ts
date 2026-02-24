import { axiosInstance } from '@/api/axios.ts';

export default async (): Promise<AdminBackendExtension[]> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .get('/api/admin/extensions')
      .then(({ data }) => resolve(data.extensions))
      .catch(reject);
  });
};

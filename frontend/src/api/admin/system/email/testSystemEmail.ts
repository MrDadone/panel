import { axiosInstance } from '@/api/axios.ts';

export default async (email: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .post('/api/admin/system/email/test', {
        email,
      })
      .then(() => resolve())
      .catch(reject);
  });
};

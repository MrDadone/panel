import { axiosInstance } from '@/api/axios.ts';

export default async (): Promise<FullUser> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .get('/api/client/account')
      .then(({ data }) => resolve(data.user))
      .catch(reject);
  });
};

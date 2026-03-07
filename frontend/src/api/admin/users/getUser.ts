import { axiosInstance } from '@/api/axios.ts';

export default async (userUuid: string): Promise<FullUser> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .get(`/api/admin/users/${userUuid}`)
      .then(({ data }) => resolve(data.user))
      .catch(reject);
  });
};

import { axiosInstance } from '@/api/axios';

export default async (hostUuid: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .post(`/api/admin/database-hosts/${hostUuid}/test`)
      .then(() => resolve())
      .catch(reject);
  });
};

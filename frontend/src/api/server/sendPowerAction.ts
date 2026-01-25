import { axiosInstance } from '@/api/axios.ts';

export default async (uuid: string, action: ServerPowerAction): Promise<void> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .post(`/api/client/servers/${uuid}/power`, {
        action,
      })
      .then(() => resolve())
      .catch(reject);
  });
};

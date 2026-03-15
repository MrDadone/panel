import { axiosInstance } from '@/api/axios.ts';

export default async (uuid: string, mountUuid: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .delete(`/api/client/servers/${uuid}/mounts/${mountUuid}`)
      .then(() => resolve())
      .catch(reject);
  });
};

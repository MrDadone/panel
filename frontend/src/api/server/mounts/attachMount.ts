import { axiosInstance } from '@/api/axios.ts';

export default async (uuid: string, mountUuid: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .post(`/api/client/servers/${uuid}/mounts`, {
        mount_uuid: mountUuid,
      })
      .then(() => resolve())
      .catch(reject);
  });
};

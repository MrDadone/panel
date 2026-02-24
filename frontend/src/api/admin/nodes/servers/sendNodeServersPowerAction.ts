import { axiosInstance } from '@/api/axios.ts';

export default async (nodeUuid: string, servers: string[], action: ServerPowerAction): Promise<number> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .post(`/api/admin/nodes/${nodeUuid}/servers/power`, {
        servers,
        action,
      })
      .then(({ data }) => resolve(data.affected))
      .catch(reject);
  });
};

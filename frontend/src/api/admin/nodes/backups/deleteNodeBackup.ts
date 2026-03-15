import { axiosInstance } from '@/api/axios.ts';

interface Data {
  force: boolean;
}

export default async (nodeUuid: string, backupUuid: string, data: Data): Promise<void> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .delete(`/api/admin/nodes/${nodeUuid}/backups/${backupUuid}`, { data })
      .then(() => resolve())
      .catch(reject);
  });
};

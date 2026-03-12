import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { serverBackupSchema } from '@/lib/schemas/server/backups.ts';

export default async (uuid: string, backupUuid: string): Promise<z.infer<typeof serverBackupSchema>> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .get(`/api/client/servers/${uuid}/backups/${backupUuid}`)
      .then(({ data }) => resolve(data.backup))
      .catch(reject);
  });
};

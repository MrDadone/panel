import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { fingerprintAlgorithm } from '@/lib/schemas/server/files.ts';

export default async (uuid: string, file: string, algorithm: z.infer<typeof fingerprintAlgorithm>): Promise<string> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .get(`/api/client/servers/${uuid}/files/fingerprint`, {
        params: {
          file,
          algorithm,
        },
      })
      .then(({ data }) => resolve(data.fingerprint))
      .catch(reject);
  });
};

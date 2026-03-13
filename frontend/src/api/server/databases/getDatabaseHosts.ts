import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { databaseHostSchema } from '@/lib/schemas/generic.ts';

export default async (uuid: string): Promise<z.infer<typeof databaseHostSchema>[]> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .get(`/api/client/servers/${uuid}/databases/hosts`)
      .then(({ data }) => resolve(data.databaseHosts))
      .catch(reject);
  });
};

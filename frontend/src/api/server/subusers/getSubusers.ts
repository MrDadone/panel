import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { serverSubuserSchema } from '@/lib/schemas/server/subusers.ts';

export default async (
  uuid: string,
  page: number,
  search?: string,
): Promise<Pagination<z.infer<typeof serverSubuserSchema>>> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .get(`/api/client/servers/${uuid}/subusers`, {
        params: { page, search },
      })
      .then(({ data }) => resolve(data.subusers))
      .catch(reject);
  });
};

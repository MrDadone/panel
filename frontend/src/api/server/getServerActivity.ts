import { z } from 'zod';
import { axiosInstance, getPaginationSet } from '@/api/axios.ts';
import { serverActivitySchema } from '@/lib/schemas/server/activity.ts';

export default async (
  uuid: string,
  page: number,
  search?: string,
): Promise<Pagination<z.infer<typeof serverActivitySchema>>> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .get(`/api/client/servers/${uuid}/activity`, {
        params: { page, search },
      })
      .then(({ data }) =>
        resolve({
          ...getPaginationSet(data.activities),
          data: data.activities.data || [],
        }),
      )
      .catch(reject);
  });
};

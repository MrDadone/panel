import { z } from 'zod';
import { axiosInstance, getPaginationSet } from '@/api/axios.ts';
import { userActivitySchema } from '@/lib/schemas/user/activity.ts';

export default async (
  userUuid: string,
  page: number,
  search?: string,
): Promise<Pagination<z.infer<typeof userActivitySchema>>> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .get(`/api/admin/users/${userUuid}/activity`, {
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

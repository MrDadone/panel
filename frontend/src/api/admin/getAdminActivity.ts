import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { activitySchema } from '@/lib/schemas/activity.ts';

export default async (page: number, search?: string): Promise<Pagination<z.infer<typeof activitySchema>>> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .get('/api/admin/activity', {
        params: { page, search },
      })
      .then(({ data }) => resolve(data.activities))
      .catch(reject);
  });
};

import { z } from 'zod';
import { axiosInstance, getPaginationSet } from '@/api/axios.ts';
import { userSessionSchema } from '@/lib/schemas/user/sessions.ts';

export default async (page: number, search?: string): Promise<Pagination<z.infer<typeof userSessionSchema>>> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .get('/api/client/account/sessions', {
        params: { page, search },
      })
      .then(({ data }) =>
        resolve({
          ...getPaginationSet(data.sessions),
          data: data.sessions.data || [],
        }),
      )
      .catch(reject);
  });
};

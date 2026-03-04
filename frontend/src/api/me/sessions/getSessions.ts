import { axiosInstance, getPaginationSet } from '@/api/axios.ts';

export default async (page: number, search?: string): Promise<Pagination<UserSession>> => {
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

import { axiosInstance } from '@/api/axios.ts';

export default async (page: number): Promise<Pagination<UserOAuthLink>> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .get('/api/client/account/oauth-links', {
        params: { page },
      })
      .then(({ data }) => resolve(data.oauthLinks))
      .catch(reject);
  });
};

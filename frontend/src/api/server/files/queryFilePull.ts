import { axiosInstance } from '@/api/axios.ts';

export default async (uuid: string, url: string): Promise<ServerPullQueryResult> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .post(`/api/client/servers/${uuid}/files/pull/query`, { url })
      .then(({ data }) => resolve(data.queryResult))
      .catch(reject);
  });
};

import { axiosInstance } from '@/api/axios.ts';

export default async (serverUuid: string, lines: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .get(`/api/admin/servers/${serverUuid}/logs`, { params: { lines }, responseType: 'text' })
      .then(({ data }) => resolve(data))
      .catch(reject);
  });
};

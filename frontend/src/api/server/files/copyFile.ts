import { axiosInstance } from '@/api/axios.ts';

export default async (uuid: string, path: string, destination: string | null): Promise<string> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .post(`/api/client/servers/${uuid}/files/copy`, { path, destination })
      .then(({ data }) => resolve(data.identifier))
      .catch(reject);
  });
};

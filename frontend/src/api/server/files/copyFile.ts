import { axiosInstance } from '@/api/axios.ts';

export default async (uuid: string, file: string, destination: string | null): Promise<string> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .post(`/api/client/servers/${uuid}/files/copy`, { file, destination })
      .then(({ data }) => resolve(data.identifier))
      .catch(reject);
  });
};

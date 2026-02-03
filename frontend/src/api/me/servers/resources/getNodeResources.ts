import { axiosInstance } from '@/api/axios.ts';

export default async (nodeUuid: string): Promise<Record<string, ResourceUsage>> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .get(`/api/client/servers/resources/${nodeUuid}`)
      .then(({ data }) => resolve(data.resources))
      .catch(reject);
  });
};

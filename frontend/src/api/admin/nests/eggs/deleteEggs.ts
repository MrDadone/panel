import { axiosInstance } from '@/api/axios.ts';

export default async (nestUuid: string, eggUuids: string[]): Promise<{ deleted: number }> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .post(`/api/admin/nests/${nestUuid}/eggs/delete`, { egg_uuids: eggUuids })
      .then(({ data }) => resolve(data))
      .catch(reject);
  });
};

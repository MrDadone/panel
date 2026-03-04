import { axiosInstance } from '@/api/axios.ts';

export default async (nodeUuid: string, page: number, search?: string): Promise<Pagination<AdminServer>> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .get(`/api/admin/nodes/${nodeUuid}/servers`, {
        params: { page, search },
      })
      .then(({ data }) => resolve(data.servers))
      .catch(reject);
  });
};

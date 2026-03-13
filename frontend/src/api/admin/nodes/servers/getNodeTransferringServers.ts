import { axiosInstance } from '@/api/axios.ts';

export default async (
  nodeUuid: string,
  page: number,
  search?: string,
): Promise<{ servers: Pagination<AdminServer>; transfers: Record<string, TransferProgress> }> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .get(`/api/admin/nodes/${nodeUuid}/servers/transfers`, {
        params: { page, search },
      })
      .then(({ data }) => resolve(data))
      .catch(reject);
  });
};

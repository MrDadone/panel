import { axiosInstance } from '@/api/axios.ts';

export interface DirectoryResponse {
  isFilesystemWritable: boolean;
  isFilesystemFast: boolean;
  entries: ResponseMeta<DirectoryEntry>;
}

export default async (uuid: string, directory: string, page: number): Promise<DirectoryResponse> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .get(`/api/client/servers/${uuid}/files/list`, {
        params: { directory: directory ?? '/', page, per_page: 100 },
      })
      .then(({ data }) => resolve(data))
      .catch(reject);
  });
};

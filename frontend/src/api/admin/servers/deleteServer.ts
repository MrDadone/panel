import { axiosInstance } from '@/api/axios';
import { transformKeysToSnakeCase } from "@/api/transformers";

interface Data {
  force: boolean;
  deleteBackups: boolean;
}

export default async (serverUuid: string, data: Data): Promise<void> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .delete(`/api/admin/servers/${serverUuid}`, {
        data: transformKeysToSnakeCase(data)
      })
      .then(() => resolve())
      .catch(reject);
  });
};

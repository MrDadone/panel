import { axiosInstance } from '@/api/axios.ts';
import { transformKeysToSnakeCase } from '@/lib/transformers.ts';

export default async (data: AdminSettings['activity']): Promise<void> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .put('/api/admin/settings', {
        activity: transformKeysToSnakeCase(data),
      })
      .then(() => resolve())
      .catch(reject);
  });
};

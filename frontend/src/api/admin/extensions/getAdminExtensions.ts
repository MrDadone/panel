import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { adminBackendExtensionSchema } from '@/lib/schemas/admin/backendExtension.ts';

export default async (): Promise<z.infer<typeof adminBackendExtensionSchema>[]> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .get('/api/admin/extensions')
      .then(({ data }) => resolve(data.extensions))
      .catch(reject);
  });
};

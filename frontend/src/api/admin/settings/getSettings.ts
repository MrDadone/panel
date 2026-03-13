import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { adminSettingsSchema } from '@/lib/schemas/admin/settings.ts';

export default async (): Promise<z.infer<typeof adminSettingsSchema>> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .get('/api/admin/settings')
      .then(({ data }) => resolve(data.settings))
      .catch(reject);
  });
};

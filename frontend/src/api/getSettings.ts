import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { publicSettingsSchema } from '@/lib/schemas/settings.ts';

export default async (): Promise<z.infer<typeof publicSettingsSchema>> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .get('/api/settings')
      .then(({ data }) => resolve(data))
      .catch(reject);
  });
};

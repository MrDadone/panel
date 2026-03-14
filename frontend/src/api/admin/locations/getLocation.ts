import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { adminLocationSchema } from '@/lib/schemas/admin/locations.ts';

export default async (locationUuid: string): Promise<z.infer<typeof adminLocationSchema>> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .get(`/api/admin/locations/${locationUuid}`)
      .then(({ data }) => resolve(data.location))
      .catch(reject);
  });
};

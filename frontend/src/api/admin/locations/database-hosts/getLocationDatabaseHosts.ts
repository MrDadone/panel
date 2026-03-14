import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { adminLocationDatabaseHostSchema } from '@/lib/schemas/admin/locations.ts';

export default async (
  locationUuid: string,
  page: number,
  search?: string,
): Promise<Pagination<z.infer<typeof adminLocationDatabaseHostSchema>>> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .get(`/api/admin/locations/${locationUuid}/database-hosts`, {
        params: { page, search },
      })
      .then(({ data }) => resolve(data.databaseHosts))
      .catch(reject);
  });
};

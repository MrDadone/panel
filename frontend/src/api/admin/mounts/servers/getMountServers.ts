import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { adminServerSchema } from '@/lib/schemas/admin/servers.ts';

export default async (
  mountUuid: string,
  page: number,
  search?: string,
): Promise<Pagination<AndCreated<{ server: z.infer<typeof adminServerSchema> }>>> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .get(`/api/admin/mounts/${mountUuid}/servers`, {
        params: { page, search },
      })
      .then(({ data }) => resolve(data.serverMounts))
      .catch(reject);
  });
};

import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { adminEggSchema } from '@/lib/schemas/admin/eggs.ts';
import { adminNestSchema } from '@/lib/schemas/admin/nests.ts';

export default async (
  mountUuid: string,
  page: number,
  search?: string,
): Promise<
  Pagination<AndCreated<{ nest: z.infer<typeof adminNestSchema>; nestEgg: z.infer<typeof adminEggSchema> }>>
> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .get(`/api/admin/mounts/${mountUuid}/nest-eggs`, {
        params: { page, search },
      })
      .then(({ data }) => resolve(data.nestEggMounts))
      .catch(reject);
  });
};

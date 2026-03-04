import { axiosInstance } from '@/api/axios.ts';

export default async (
  mountUuid: string,
  page: number,
  search?: string,
): Promise<Pagination<AndCreated<{ nest: AdminNest; nestEgg: AdminNestEgg }>>> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .get(`/api/admin/mounts/${mountUuid}/nest-eggs`, {
        params: { page, search },
      })
      .then(({ data }) => resolve(data.nestEggMounts))
      .catch(reject);
  });
};

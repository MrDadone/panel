import { axiosInstance } from '@/api/axios.ts';

export default async (
  eggRepositoryUuid: string,
  eggRepositoryEggUuids: string[],
  nestUuid: string,
): Promise<number> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .post(`/api/admin/egg-repositories/${eggRepositoryUuid}/eggs/install`, {
        nest_uuid: nestUuid,
        egg_uuids: eggRepositoryEggUuids,
      })
      .then(({ data }) => resolve(data.installed))
      .catch(reject);
  });
};

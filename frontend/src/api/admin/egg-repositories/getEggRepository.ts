import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { adminEggRepositorySchema } from '@/lib/schemas/admin/eggRepositories.ts';

export default async (eggRepositoryUuid: string): Promise<z.infer<typeof adminEggRepositorySchema>> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .get(`/api/admin/egg-repositories/${eggRepositoryUuid}`)
      .then(({ data }) => resolve(data.eggRepository))
      .catch(reject);
  });
};

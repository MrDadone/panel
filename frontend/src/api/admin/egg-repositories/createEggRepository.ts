import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { adminEggRepositorySchema, adminEggRepositoryUpdateSchema } from '@/lib/schemas/admin/eggRepositories.ts';
import { transformKeysToSnakeCase } from '@/lib/transformers.ts';

export default async (
  data: z.infer<typeof adminEggRepositoryUpdateSchema>,
): Promise<z.infer<typeof adminEggRepositorySchema>> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .post('/api/admin/egg-repositories', transformKeysToSnakeCase(data))
      .then(({ data }) => resolve(data.eggRepository))
      .catch(reject);
  });
};

import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { adminEggRepositoryUpdateSchema } from '@/lib/schemas/admin/eggRepositories.ts';
import { transformKeysToSnakeCase } from '@/lib/transformers.ts';

export default async (
  eggRepositoryUuid: string,
  data: z.infer<typeof adminEggRepositoryUpdateSchema>,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .patch(`/api/admin/egg-repositories/${eggRepositoryUuid}`, transformKeysToSnakeCase(data))
      .then(() => resolve())
      .catch(reject);
  });
};

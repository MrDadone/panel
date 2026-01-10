import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { adminEggScriptSchema } from '@/lib/schemas/admin/eggs.ts';
import { transformKeysToSnakeCase } from '@/lib/transformers.ts';

export default async (nestUuid: string, eggUuid: string, data: z.infer<typeof adminEggScriptSchema>): Promise<void> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .patch(`/api/admin/nests/${nestUuid}/eggs/${eggUuid}`, {
        config_script: transformKeysToSnakeCase(data),
      })
      .then(() => resolve())
      .catch(reject);
  });
};

import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { adminNodeSchema, adminNodeUpdateSchema } from '@/lib/schemas/admin/nodes.ts';
import { transformKeysToSnakeCase } from '@/lib/transformers.ts';

export default async (data: z.infer<typeof adminNodeUpdateSchema>): Promise<z.infer<typeof adminNodeSchema>> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .post('/api/admin/nodes', transformKeysToSnakeCase(data))
      .then(({ data }) => resolve(data.node))
      .catch(reject);
  });
};

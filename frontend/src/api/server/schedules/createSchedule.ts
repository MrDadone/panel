import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { serverScheduleSchema, serverScheduleUpdateSchema } from '@/lib/schemas/server/schedules.ts';
import { transformKeysToSnakeCase } from '@/lib/transformers.ts';

export default async (
  uuid: string,
  data: z.infer<typeof serverScheduleUpdateSchema>,
): Promise<z.infer<typeof serverScheduleSchema>> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .post(`/api/client/servers/${uuid}/schedules`, transformKeysToSnakeCase(data))
      .then(({ data }) => resolve(data.schedule))
      .catch(reject);
  });
};

import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { serverScheduleStepSchema, serverScheduleStepUpdateSchema } from '@/lib/schemas/server/schedules.ts';
import { transformKeysToSnakeCase } from '@/lib/transformers.ts';

export default async (
  serverUuid: string,
  scheduleUuid: string,
  data: z.infer<typeof serverScheduleStepUpdateSchema>,
): Promise<z.infer<typeof serverScheduleStepSchema>> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .post(`/api/client/servers/${serverUuid}/schedules/${scheduleUuid}/steps`, transformKeysToSnakeCase(data))
      .then(({ data }) => resolve(data.scheduleStep))
      .catch(reject);
  });
};

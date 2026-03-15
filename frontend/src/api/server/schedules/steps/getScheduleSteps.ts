import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { serverScheduleStepSchema } from '@/lib/schemas/server/schedules.ts';

export default async (
  serverUuid: string,
  scheduleUuid: string,
): Promise<z.infer<typeof serverScheduleStepSchema>[]> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .get(`/api/client/servers/${serverUuid}/schedules/${scheduleUuid}/steps`)
      .then(({ data }) => resolve(data.scheduleSteps))
      .catch(reject);
  });
};

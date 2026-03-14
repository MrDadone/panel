import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { serverScheduleStatusSchema } from '@/lib/schemas/server/schedules.ts';

export default async (
  serverUuid: string,
  scheduleUuid: string,
): Promise<z.infer<typeof serverScheduleStatusSchema>> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .get(`/api/client/servers/${serverUuid}/schedules/${scheduleUuid}/status`)
      .then(({ data }) => resolve(data.status))
      .catch(reject);
  });
};

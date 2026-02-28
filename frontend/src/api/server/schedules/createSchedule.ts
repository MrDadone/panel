import { axiosInstance } from '@/api/axios.ts';
import { transformKeysToSnakeCase } from '@/lib/transformers.ts';

export default async (
  uuid: string,
  data: Partial<ServerSchedule>,
  // data: z.infer<typeof serverScheduleSchema>,
): Promise<ServerSchedule> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .post(`/api/client/servers/${uuid}/schedules`, transformKeysToSnakeCase(data))
      .then(({ data }) => resolve(data.schedule))
      .catch(reject);
  });
};

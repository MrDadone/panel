import { axiosInstance } from '@/api/axios';
import { transformKeysToSnakeCase } from '@/api/transformers';

interface Data {
  action: ScheduleAction;
  order: number;
}

export default async (serverUuid: string, scheduleUuid: string, stepUuid: string, data: Data): Promise<void> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .patch(
        `/api/client/servers/${serverUuid}/schedules/${scheduleUuid}/steps/${stepUuid}`,
        transformKeysToSnakeCase(data),
      )
      .then(() => resolve())
      .catch(reject);
  });
};

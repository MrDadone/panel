import { axiosInstance } from '@/api/axios.ts';

export default async (
  nestUuid: string,
  eggUuids: string[],
  destinationNestUuid: string,
): Promise<{ moved: number }> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .post(`/api/admin/nests/${nestUuid}/eggs/move`, {
        egg_uuids: eggUuids,
        destination_nest_uuid: destinationNestUuid,
      })
      .then(({ data }) => resolve(data))
      .catch(reject);
  });
};

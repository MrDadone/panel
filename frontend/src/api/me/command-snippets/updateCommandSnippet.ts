import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { userCommandSnippetUpdateSchema } from '@/lib/schemas/user/commandSnippets.ts';

export default async (
  commandSnippetUuid: string,
  data: z.infer<typeof userCommandSnippetUpdateSchema>,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .patch(`/api/client/account/command-snippets/${commandSnippetUuid}`, data)
      .then(() => resolve())
      .catch(reject);
  });
};

import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { userCommandSnippetSchema } from '@/lib/schemas/user/commandSnippets.ts';

export default async (eggUuid: string): Promise<z.infer<typeof userCommandSnippetSchema>[]> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .get(`/api/client/servers/eggs/${eggUuid}/command-snippets`)
      .then(({ data }) => resolve(data.commandSnippets))
      .catch(reject);
  });
};

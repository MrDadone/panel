import { axiosInstance } from '@/api/axios.ts';

export default async (commandSnippetUuid: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .delete(`/api/client/account/command-snippets/${commandSnippetUuid}`)
      .then(() => resolve())
      .catch(reject);
  });
};

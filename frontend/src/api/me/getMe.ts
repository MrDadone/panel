import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { fullUserSchema } from '@/lib/schemas/user.ts';

export default async (): Promise<z.infer<typeof fullUserSchema>> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .get('/api/client/account')
      .then(({ data }) => resolve(data.user))
      .catch(reject);
  });
};

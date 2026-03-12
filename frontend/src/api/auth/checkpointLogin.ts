import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { fullUserSchema } from '@/lib/schemas/user.ts';

interface Data {
  code: string;
  confirmation_token: string;
}

interface Response {
  user: z.infer<typeof fullUserSchema>;
}

export default async ({ code, confirmation_token }: Data): Promise<Response> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .post('/api/auth/login/checkpoint', { code, confirmation_token })
      .then(({ data }) => resolve(data))
      .catch(reject);
  });
};

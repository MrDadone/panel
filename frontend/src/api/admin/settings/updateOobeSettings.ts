import { z } from 'zod';
import { axiosInstance } from '@/api/axios.ts';
import { oobeStepKey } from '@/lib/schemas/oobe.ts';

export default async (step: z.infer<typeof oobeStepKey>): Promise<void> => {
  return new Promise((resolve, reject) => {
    axiosInstance
      .put('/api/admin/settings', {
        oobe_step: step,
      })
      .then(() => resolve())
      .catch(reject);
  });
};

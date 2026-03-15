import { z } from 'zod';
import { fullUserSchema } from '@/lib/schemas/user.ts';

export const isAdmin = (user: z.infer<typeof fullUserSchema> | null) => {
  return user?.admin || (user?.role?.adminPermissions || []).length > 0;
};

import { roleSchema } from '@/lib/schemas/user.ts';

export const adminRoleUpdateSchema = roleSchema.omit({
  uuid: true,
  created: true,
});

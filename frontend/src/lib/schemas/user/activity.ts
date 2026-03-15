import { activitySchema } from '@/lib/schemas/activity.ts';

export const userActivitySchema = activitySchema.omit({
  user: true,
});

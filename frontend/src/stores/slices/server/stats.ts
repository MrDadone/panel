import { z } from 'zod';
import { StateCreator } from 'zustand';
import { serverResourceUsageSchema } from '@/lib/schemas/server/server.ts';
import { ServerStore } from '@/stores/server.ts';

export interface StatsSlice {
  stats: z.infer<typeof serverResourceUsageSchema> | null;

  setStats: (stats: z.infer<typeof serverResourceUsageSchema>) => void;
}

export const createStatsSlice: StateCreator<ServerStore, [], [], StatsSlice> = (set): StatsSlice => ({
  stats: null,

  setStats: (value) => set((state) => ({ ...state, stats: value })),
});

import { z } from 'zod';
import { StateCreator } from 'zustand';
import { serverPowerState } from '@/lib/schemas/server/server.ts';
import { ServerStore } from '@/stores/server.ts';

export interface StateSlice {
  state: z.infer<typeof serverPowerState>;

  setState: (status: z.infer<typeof serverPowerState>) => void;
}

export const createStateSlice: StateCreator<ServerStore, [], [], StateSlice> = (set): StateSlice => ({
  state: 'offline',

  setState: (value) => set((state) => ({ ...state, state: value })),
});

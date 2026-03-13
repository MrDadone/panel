import { z } from 'zod';
import { StateCreator } from 'zustand';
import { apiPermissionsSchema } from '@/lib/schemas/generic.ts';
import { GlobalStore } from '@/stores/global.ts';

export interface PermissionsSlice {
  availablePermissions: z.infer<typeof apiPermissionsSchema>;

  setAvailablePermissions: (permissions: z.infer<typeof apiPermissionsSchema>) => void;
}

export const createPermissionsSlice: StateCreator<GlobalStore, [], [], PermissionsSlice> = (set): PermissionsSlice => ({
  availablePermissions: {
    adminPermissions: {},
    userPermissions: {},
    serverPermissions: {},
  },

  setAvailablePermissions: (value) => set((state) => ({ ...state, availablePermissions: value })),
});

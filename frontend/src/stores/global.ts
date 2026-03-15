import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createPermissionsSlice, PermissionsSlice } from './slices/global/permissions.ts';
import { createSettingsSlice, SettingsSlice } from './slices/global/settings.ts';

export interface GlobalStore extends PermissionsSlice, SettingsSlice {}

export const useGlobalStore = create<GlobalStore>()(
  persist(
    (...a) => ({
      ...createPermissionsSlice(...a),
      ...createSettingsSlice(...a),
    }),
    { name: 'global' },
  ),
);

export function getGlobalStore() {
  return useGlobalStore.getState();
}

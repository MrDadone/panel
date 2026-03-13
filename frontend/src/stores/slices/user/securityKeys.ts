import { z } from 'zod';
import { StateCreator } from 'zustand';
import { getEmptyPaginationSet } from '@/api/axios.ts';
import { userSecurityKeySchema } from '@/lib/schemas/user/securityKeys.ts';
import { UserStore } from '@/stores/user.ts';

export interface SecurityKeySlice {
  securityKeys: Pagination<z.infer<typeof userSecurityKeySchema>>;

  setSecurityKeys: (keys: Pagination<z.infer<typeof userSecurityKeySchema>>) => void;
  addSecurityKey: (key: z.infer<typeof userSecurityKeySchema>) => void;
  removeSecurityKey: (key: z.infer<typeof userSecurityKeySchema>) => void;
  updateSecurityKey: (uuid: string, data: Partial<z.infer<typeof userSecurityKeySchema>>) => void;
}

export const createSecurityKeysSlice: StateCreator<UserStore, [], [], SecurityKeySlice> = (set): SecurityKeySlice => ({
  securityKeys: getEmptyPaginationSet<z.infer<typeof userSecurityKeySchema>>(),

  setSecurityKeys: (value) => set((state) => ({ ...state, securityKeys: value })),
  addSecurityKey: (key) =>
    set((state) => ({
      securityKeys: {
        ...state.securityKeys,
        data: [...state.securityKeys.data, key],
        total: state.securityKeys.total + 1,
      },
    })),
  removeSecurityKey: (key) =>
    set((state) => ({
      securityKeys: {
        ...state.securityKeys,
        data: state.securityKeys.data.filter((k) => k.uuid !== key.uuid),
        total: state.securityKeys.total - 1,
      },
    })),
  updateSecurityKey: (uuid, data) =>
    set((state) => ({
      securityKeys: {
        ...state.securityKeys,
        data: state.securityKeys.data.map((k) => (k.uuid === uuid ? { ...k, ...data } : k)),
      },
    })),
});

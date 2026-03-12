import { z } from 'zod';
import { StateCreator } from 'zustand';
import { getEmptyPaginationSet } from '@/api/axios.ts';
import { userSshKeySchema } from '@/lib/schemas/user/sshKeys.ts';
import { UserStore } from '@/stores/user.ts';

export interface SshKeySlice {
  sshKeys: Pagination<z.infer<typeof userSshKeySchema>>;

  setSshKeys: (keys: Pagination<z.infer<typeof userSshKeySchema>>) => void;
  addSshKey: (key: z.infer<typeof userSshKeySchema>) => void;
  removeSshKey: (key: z.infer<typeof userSshKeySchema>) => void;
  updateSshKey: (uuid: string, data: Partial<z.infer<typeof userSshKeySchema>>) => void;
}

export const createSshKeysSlice: StateCreator<UserStore, [], [], SshKeySlice> = (set): SshKeySlice => ({
  sshKeys: getEmptyPaginationSet<z.infer<typeof userSshKeySchema>>(),

  setSshKeys: (value) => set((state) => ({ ...state, sshKeys: value })),
  addSshKey: (key) =>
    set((state) => ({
      sshKeys: {
        ...state.sshKeys,
        data: [...state.sshKeys.data, key],
        total: state.sshKeys.total + 1,
      },
    })),
  removeSshKey: (key) =>
    set((state) => ({
      sshKeys: {
        ...state.sshKeys,
        data: state.sshKeys.data.filter((k) => k.uuid !== key.uuid),
        total: state.sshKeys.total - 1,
      },
    })),
  updateSshKey: (uuid, data) =>
    set((state) => ({
      sshKeys: {
        ...state.sshKeys,
        data: state.sshKeys.data.map((k) => (k.uuid === uuid ? { ...k, ...data } : k)),
      },
    })),
});

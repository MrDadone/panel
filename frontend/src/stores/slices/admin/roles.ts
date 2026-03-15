import { z } from 'zod';
import { StateCreator } from 'zustand';
import { getEmptyPaginationSet } from '@/api/axios.ts';
import { roleSchema } from '@/lib/schemas/user.ts';
import { AdminStore } from '@/stores/admin.tsx';

export interface RolesSlice {
  roles: Pagination<z.infer<typeof roleSchema>>;

  setRoles: (roles: Pagination<z.infer<typeof roleSchema>>) => void;
  addRole: (role: z.infer<typeof roleSchema>) => void;
  removeRole: (role: z.infer<typeof roleSchema>) => void;
}

export const createRolesSlice: StateCreator<AdminStore, [], [], RolesSlice> = (set): RolesSlice => ({
  roles: getEmptyPaginationSet<z.infer<typeof roleSchema>>(),

  setRoles: (value) => set((state) => ({ ...state, roles: value })),
  addRole: (role) =>
    set((state) => ({
      roles: {
        ...state.roles,
        data: [...state.roles.data, role],
        total: state.roles.total + 1,
      },
    })),
  removeRole: (role) =>
    set((state) => ({
      roles: {
        ...state.roles,
        data: state.roles.data.filter((r) => r.uuid !== role.uuid),
        total: state.roles.total - 1,
      },
    })),
});

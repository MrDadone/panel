import { z } from 'zod';
import { StateCreator } from 'zustand';
import { getEmptyPaginationSet } from '@/api/axios.ts';
import { serverSubuserSchema } from '@/lib/schemas/server/subusers.ts';
import { ServerStore } from '@/stores/server.ts';

export interface SubusersSlice {
  subusers: Pagination<z.infer<typeof serverSubuserSchema>>;

  setSubusers: (subusers: Pagination<z.infer<typeof serverSubuserSchema>>) => void;
  addSubuser: (subusers: z.infer<typeof serverSubuserSchema>) => void;
  removeSubuser: (subusers: z.infer<typeof serverSubuserSchema>) => void;
}

export const createSubusersSlice: StateCreator<ServerStore, [], [], SubusersSlice> = (set): SubusersSlice => ({
  subusers: getEmptyPaginationSet<z.infer<typeof serverSubuserSchema>>(),
  setSubusers: (value) => set((state) => ({ ...state, subusers: value })),
  addSubuser: (subuser) =>
    set((state) => ({
      subusers: {
        ...state.subusers,
        data: [...state.subusers.data, subuser],
        total: state.subusers.total + 1,
      },
    })),
  removeSubuser: (subuser) =>
    set((state) => ({
      subusers: {
        ...state.subusers,
        data: state.subusers.data.filter((s) => s.user.uuid !== subuser.user.uuid),
        total: state.subusers.total - 1,
      },
    })),
});

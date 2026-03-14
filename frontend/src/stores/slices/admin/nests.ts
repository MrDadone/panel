import { z } from 'zod';
import { StateCreator } from 'zustand';
import { getEmptyPaginationSet } from '@/api/axios.ts';
import { adminNestSchema } from '@/lib/schemas/admin/nests.ts';
import { AdminStore } from '@/stores/admin.tsx';

export interface NestsSlice {
  nests: Pagination<z.infer<typeof adminNestSchema>>;

  setNests: (nests: Pagination<z.infer<typeof adminNestSchema>>) => void;
  addNest: (nest: z.infer<typeof adminNestSchema>) => void;
  removeNest: (nest: z.infer<typeof adminNestSchema>) => void;
}

export const createNestsSlice: StateCreator<AdminStore, [], [], NestsSlice> = (set): NestsSlice => ({
  nests: getEmptyPaginationSet<z.infer<typeof adminNestSchema>>(),

  setNests: (value) => set((state) => ({ ...state, nests: value })),
  addNest: (nest) =>
    set((state) => ({
      nests: {
        ...state.nests,
        data: [...state.nests.data, nest],
        total: state.nests.total + 1,
      },
    })),
  removeNest: (nest) =>
    set((state) => ({
      nests: {
        ...state.nests,
        data: state.nests.data.filter((n) => n.uuid !== nest.uuid),
        total: state.nests.total - 1,
      },
    })),
});

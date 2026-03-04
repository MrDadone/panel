import { StateCreator } from 'zustand';
import { getEmptyPaginationSet } from '@/api/axios.ts';
import { AdminStore } from '@/stores/admin.tsx';

export interface NestsSlice {
  nests: Pagination<AdminNest>;

  setNests: (nests: Pagination<AdminNest>) => void;
  addNest: (nest: AdminNest) => void;
  removeNest: (nest: AdminNest) => void;
}

export const createNestsSlice: StateCreator<AdminStore, [], [], NestsSlice> = (set): NestsSlice => ({
  nests: getEmptyPaginationSet<AdminNest>(),

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

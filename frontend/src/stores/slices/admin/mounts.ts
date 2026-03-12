import { z } from 'zod';
import { StateCreator } from 'zustand';
import { getEmptyPaginationSet } from '@/api/axios.ts';
import { adminMountSchema } from '@/lib/schemas/admin/mounts.ts';
import { AdminStore } from '@/stores/admin.tsx';

export interface MountsSlice {
  mounts: Pagination<z.infer<typeof adminMountSchema>>;

  setMounts: (mounts: Pagination<z.infer<typeof adminMountSchema>>) => void;
  addMount: (mount: z.infer<typeof adminMountSchema>) => void;
  removeMount: (mount: z.infer<typeof adminMountSchema>) => void;
}

export const createMountsSlice: StateCreator<AdminStore, [], [], MountsSlice> = (set): MountsSlice => ({
  mounts: getEmptyPaginationSet<z.infer<typeof adminMountSchema>>(),

  setMounts: (value) => set((state) => ({ ...state, mounts: value })),
  addMount: (mount) =>
    set((state) => ({
      mounts: {
        ...state.mounts,
        data: [...state.mounts.data, mount],
        total: state.mounts.total + 1,
      },
    })),
  removeMount: (mount) =>
    set((state) => ({
      mounts: {
        ...state.mounts,
        data: state.mounts.data.filter((dh) => dh.uuid !== mount.uuid),
        total: state.mounts.total - 1,
      },
    })),
});

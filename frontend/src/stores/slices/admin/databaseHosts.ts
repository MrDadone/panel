import { z } from 'zod';
import { StateCreator } from 'zustand';
import { getEmptyPaginationSet } from '@/api/axios.ts';
import { adminDatabaseHostSchema } from '@/lib/schemas/admin/databaseHosts.ts';
import { AdminStore } from '@/stores/admin.tsx';

export interface DatabaseHostsSlice {
  databaseHosts: Pagination<z.infer<typeof adminDatabaseHostSchema>>;

  setDatabaseHosts: (databaseHosts: Pagination<z.infer<typeof adminDatabaseHostSchema>>) => void;
  addDatabaseHosts: (databaseHost: z.infer<typeof adminDatabaseHostSchema>) => void;
  removeDatabaseHosts: (databaseHost: z.infer<typeof adminDatabaseHostSchema>) => void;
}

export const createDatabaseHostsSlice: StateCreator<AdminStore, [], [], DatabaseHostsSlice> = (
  set,
): DatabaseHostsSlice => ({
  databaseHosts: getEmptyPaginationSet<z.infer<typeof adminDatabaseHostSchema>>(),

  setDatabaseHosts: (value) => set((state) => ({ ...state, databaseHosts: value })),
  addDatabaseHosts: (databaseHost) =>
    set((state) => ({
      databaseHosts: {
        ...state.databaseHosts,
        data: [...state.databaseHosts.data, databaseHost],
        total: state.databaseHosts.total + 1,
      },
    })),
  removeDatabaseHosts: (databaseHost) =>
    set((state) => ({
      databaseHosts: {
        ...state.databaseHosts,
        data: state.databaseHosts.data.filter((dh) => dh.uuid !== databaseHost.uuid),
        total: state.databaseHosts.total - 1,
      },
    })),
});

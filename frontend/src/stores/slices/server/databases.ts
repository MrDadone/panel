import { z } from 'zod';
import { StateCreator } from 'zustand';
import { getEmptyPaginationSet } from '@/api/axios.ts';
import { serverDatabaseSchema } from '@/lib/schemas/server/databases.ts';
import { ServerStore } from '@/stores/server.ts';

export interface DatabasesSlice {
  databases: Pagination<z.infer<typeof serverDatabaseSchema>>;

  setDatabases: (databases: Pagination<z.infer<typeof serverDatabaseSchema>>) => void;
  addDatabase: (database: z.infer<typeof serverDatabaseSchema>) => void;
  removeDatabase: (database: z.infer<typeof serverDatabaseSchema>) => void;
}

export const createDatabasesSlice: StateCreator<ServerStore, [], [], DatabasesSlice> = (set): DatabasesSlice => ({
  databases: getEmptyPaginationSet<z.infer<typeof serverDatabaseSchema>>(),

  setDatabases: (value) => set((state) => ({ ...state, databases: value })),
  addDatabase: (database) =>
    set((state) => ({
      databases: {
        ...state.databases,
        data: [...state.databases.data, database],
        total: state.databases.total + 1,
      },
    })),
  removeDatabase: (database) =>
    set((state) => ({
      databases: {
        ...state.databases,
        data: state.databases.data.filter((d) => d.uuid !== database.uuid),
        total: state.databases.total - 1,
      },
    })),
});

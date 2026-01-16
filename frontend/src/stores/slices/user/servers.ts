import QuickLRU from 'quick-lru';
import { StateCreator } from 'zustand';
import { getEmptyPaginationSet } from '@/api/axios.ts';
import getServerResourceUsage from '@/api/server/getServerResourceUsage.ts';
import { UserStore } from '@/stores/user.ts';

export interface ServerSlice {
  servers: ResponseMeta<Server>;
  serverResourceUsage: QuickLRU<string, ResourceUsage>;
  serverResourceUsagePending: Set<string>;
  serverGroups: UserServerGroup[];

  setServers: (servers: ResponseMeta<Server>) => void;
  addServerResourceUsage: (uuid: string, usage: ResourceUsage) => void;
  getServerResourceUsage: (uuid: string) => ResourceUsage | undefined;
  setServerGroups: (serverGroups: UserServerGroup[]) => void;
  addServerGroup: (serverGroup: UserServerGroup) => void;
  removeServerGroup: (serverGroup: UserServerGroup) => void;
  updateServerGroup: (uuid: string, data: { name?: string; serverOrder?: string[] }) => void;
}

export const createServersSlice: StateCreator<UserStore, [], [], ServerSlice> = (set, get): ServerSlice => ({
  servers: getEmptyPaginationSet<Server>(),
  serverResourceUsage: new QuickLRU<string, ResourceUsage>({ maxSize: 100, maxAge: 1000 * 30 }),
  serverResourceUsagePending: new Set<string>(),
  serverGroups: [],

  setServers: (value) => set((state) => ({ ...state, servers: value })),
  setServerGroups: (value) => set((state) => ({ ...state, serverGroups: value })),
  addServerGroup: (serverGroup) =>
    set((state) => ({
      serverGroups: [...state.serverGroups, serverGroup],
    })),
  removeServerGroup: (serverGroup) =>
    set((state) => ({
      serverGroups: state.serverGroups.filter((g) => g.uuid !== serverGroup.uuid),
    })),
  updateServerGroup: (uuid, data) =>
    set((state) => ({
      serverGroups: state.serverGroups.map((g) => (g.uuid === uuid ? { ...g, ...data } : g)),
    })),

  addServerResourceUsage: (uuid, usage) =>
    set((state) => {
      state.serverResourceUsage.set(uuid, usage);
      return { ...state, serverResourceUsage: state.serverResourceUsage };
    }),
  getServerResourceUsage: (uuid) => {
    const usage = get().serverResourceUsage.get(uuid);
    if (!usage && !get().serverResourceUsagePending.has(uuid)) {
      set((state) => {
        state.serverResourceUsagePending.add(uuid);
        return { ...state, serverResourceUsagePending: state.serverResourceUsagePending };
      });

      getServerResourceUsage(uuid)
        .then((usage) => {
          set((state) => {
            state.serverResourceUsage.set(uuid, usage);
            state.serverResourceUsagePending.delete(uuid);
            return {
              ...state,
              serverResourceUsage: state.serverResourceUsage,
              serverResourceUsagePending: state.serverResourceUsagePending,
            };
          });
        })
        .catch((err) => {
          console.error(`Failed to fetch resource usage for server ${uuid}:`, err);

          setTimeout(() => {
            set((state) => {
              state.serverResourceUsagePending.delete(uuid);
              return { ...state, serverResourceUsagePending: new Set(state.serverResourceUsagePending) };
            });
          }, 30000);
        });
    }

    return usage;
  },
});

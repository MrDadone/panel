import QuickLRU from 'quick-lru';
import { StateCreator } from 'zustand';
import { getEmptyPaginationSet } from '@/api/axios.ts';
import getNodeResources from '@/api/me/servers/resources/getNodeResources.ts';
import { UserStore } from '@/stores/user.ts';

export interface ServerSlice {
  servers: ResponseMeta<Server>;
  serverResourceUsage: QuickLRU<string, ResourceUsage>;
  serverResourceUsagePendingNodes: Set<string>;
  serverGroups: UserServerGroup[];

  setServers: (servers: ResponseMeta<Server>) => void;
  addServerResourceUsage: (uuid: string, usage: ResourceUsage) => void;
  getServerResourceUsage: (uuid: string, nodeUuid: string) => ResourceUsage | undefined;
  setServerGroups: (serverGroups: UserServerGroup[]) => void;
  addServerGroup: (serverGroup: UserServerGroup) => void;
  removeServerGroup: (serverGroup: UserServerGroup) => void;
  updateServerGroup: (uuid: string, data: { name?: string; serverOrder?: string[] }) => void;
}

export const createServersSlice: StateCreator<UserStore, [], [], ServerSlice> = (set, get): ServerSlice => ({
  servers: getEmptyPaginationSet<Server>(),
  serverResourceUsage: new QuickLRU<string, ResourceUsage>({ maxSize: 100, maxAge: 1000 * 30 }),
  serverResourceUsagePendingNodes: new Set<string>(),
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
  getServerResourceUsage: (uuid, nodeUuid) => {
    const state = get();
    const usage = state.serverResourceUsage.get(uuid);

    if (usage) return usage;
    if (state.serverResourceUsagePendingNodes.has(nodeUuid)) return undefined;

    let shouldFetch = false;

    set((state) => {
      if (state.serverResourceUsagePendingNodes.has(nodeUuid)) {
        return state;
      }

      shouldFetch = true;

      const newPending = new Set(state.serverResourceUsagePendingNodes);
      newPending.add(nodeUuid);

      return { ...state, serverResourceUsagePendingNodes: newPending };
    });

    if (shouldFetch) {
      getNodeResources(nodeUuid)
        .then((usages) => {
          set((state) => {
            for (const [serverId, resources] of Object.entries(usages)) {
              state.serverResourceUsage.set(serverId, resources);
            }

            const newPending = new Set(state.serverResourceUsagePendingNodes);
            newPending.delete(nodeUuid);

            return {
              ...state,
              serverResourceUsage: state.serverResourceUsage,
              serverResourceUsagePendingNodes: newPending,
            };
          });
        })
        .catch((err) => {
          console.error(`Failed to fetch resources for node ${nodeUuid}:`, err);

          setTimeout(() => {
            set((state) => {
              const newPending = new Set(state.serverResourceUsagePendingNodes);
              newPending.delete(nodeUuid);
              return { ...state, serverResourceUsagePendingNodes: newPending };
            });
          }, 30000);
        });
    }

    return undefined;
  },
});

import QuickLRU from 'quick-lru';
import { z } from 'zod';
import { StateCreator } from 'zustand';
import { getEmptyPaginationSet } from '@/api/axios.ts';
import getNodeResources from '@/api/me/servers/resources/getNodeResources.ts';
import { userServerGroupSchema } from '@/lib/schemas/user.ts';
import { UserStore } from '@/stores/user.ts';

const CACHE_TTL_MS = 1000 * 30;

export interface ServerSlice {
  servers: Pagination<Server>;
  serverGroups: z.infer<typeof userServerGroupSchema>[];

  serverResourceUsage: QuickLRU<string, ResourceUsage>;
  resourceUsageTick: number;

  _nodeFetchTimestamps: Map<string, number>;
  _pendingNodeFetches: Map<string, Promise<void>>;

  setServers: (servers: Pagination<Server>) => void;
  setServerGroups: (serverGroups: z.infer<typeof userServerGroupSchema>[]) => void;
  addServerGroup: (serverGroup: z.infer<typeof userServerGroupSchema>) => void;
  removeServerGroup: (serverGroup: z.infer<typeof userServerGroupSchema>) => void;
  updateServerGroup: (uuid: string, data: { name?: string; serverOrder?: string[] }) => void;

  addServerResourceUsage: (serverUuid: string, usage: ResourceUsage) => void;
  getServerResourceUsage: (uuid: string) => ResourceUsage | undefined;
  fetchNodeResources: (nodeUuid: string) => Promise<void>;
}

export const createServersSlice: StateCreator<UserStore, [], [], ServerSlice> = (set, get) => ({
  servers: getEmptyPaginationSet<Server>(),
  serverGroups: [],

  serverResourceUsage: new QuickLRU<string, ResourceUsage>({ maxSize: 100, maxAge: CACHE_TTL_MS }),
  resourceUsageTick: 0,

  _nodeFetchTimestamps: new Map(),
  _pendingNodeFetches: new Map(),

  setServers: (value) => set({ servers: value }),
  setServerGroups: (value) => set({ serverGroups: value }),
  addServerGroup: (serverGroup) => set((state) => ({ serverGroups: [...state.serverGroups, serverGroup] })),
  removeServerGroup: (serverGroup) =>
    set((state) => ({
      serverGroups: state.serverGroups.filter((g) => g.uuid !== serverGroup.uuid),
    })),
  updateServerGroup: (uuid, data) =>
    set((state) => ({
      serverGroups: state.serverGroups.map((g) => (g.uuid === uuid ? { ...g, ...data } : g)),
    })),

  addServerResourceUsage: (serverUuid, usage) => {
    set((state) => {
      state.serverResourceUsage.set(serverUuid, usage);
      return { resourceUsageTick: state.resourceUsageTick + 1 };
    });
  },

  getServerResourceUsage: (uuid) => {
    return get().serverResourceUsage.get(uuid);
  },

  fetchNodeResources: async (nodeUuid) => {
    const state = get();
    const now = Date.now();

    const lastFetch = state._nodeFetchTimestamps.get(nodeUuid) || 0;
    if (now - lastFetch < CACHE_TTL_MS) {
      return;
    }

    if (state._pendingNodeFetches.has(nodeUuid)) {
      return state._pendingNodeFetches.get(nodeUuid);
    }

    const fetchPromise = (async () => {
      try {
        const usages = await getNodeResources(nodeUuid);

        set((s) => {
          for (const [serverId, resources] of Object.entries(usages)) {
            s.serverResourceUsage.set(serverId, resources);
          }
          s._nodeFetchTimestamps.set(nodeUuid, Date.now());

          return { resourceUsageTick: s.resourceUsageTick + 1 };
        });
      } catch (err) {
        console.error(`Failed to fetch resources for node ${nodeUuid}:`, err);
      } finally {
        get()._pendingNodeFetches.delete(nodeUuid);
      }
    })();

    state._pendingNodeFetches.set(nodeUuid, fetchPromise);
    return fetchPromise;
  },
});

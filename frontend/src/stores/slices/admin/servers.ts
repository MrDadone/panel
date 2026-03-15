import { z } from 'zod';
import { StateCreator } from 'zustand';
import { getEmptyPaginationSet } from '@/api/axios.ts';
import { adminServerMountSchema, adminServerSchema } from '@/lib/schemas/admin/servers.ts';
import { serverAllocationSchema } from '@/lib/schemas/server/allocations.ts';
import { serverVariableSchema } from '@/lib/schemas/server/startup.ts';
import { AdminStore } from '@/stores/admin.tsx';

export interface ServersSlice {
  servers: Pagination<z.infer<typeof adminServerSchema>>;
  serverAllocations: Pagination<z.infer<typeof serverAllocationSchema>>;
  serverVariables: z.infer<typeof serverVariableSchema>[];
  serverMounts: Pagination<z.infer<typeof adminServerMountSchema>>;

  setServers: (servers: Pagination<z.infer<typeof adminServerSchema>>) => void;
  addServer: (server: z.infer<typeof adminServerSchema>) => void;
  removeServer: (server: z.infer<typeof adminServerSchema>) => void;
  updateServer: (server: z.infer<typeof adminServerSchema>) => void;

  setServerAllocations: (allocations: Pagination<z.infer<typeof serverAllocationSchema>>) => void;
  addServerAllocation: (allocation: z.infer<typeof serverAllocationSchema>) => void;
  removeServerAllocation: (allocation: z.infer<typeof serverAllocationSchema>) => void;

  setServerVariables: (variables: z.infer<typeof serverVariableSchema>[]) => void;
  updateServerVariable: (envVariable: string, updatedProps: Partial<z.infer<typeof serverVariableSchema>>) => void;

  setServerMounts: (mounts: Pagination<z.infer<typeof adminServerMountSchema>>) => void;
  addServerMount: (mount: z.infer<typeof adminServerMountSchema>) => void;
  removeServerMount: (mount: z.infer<typeof adminServerMountSchema>) => void;
}

export const createServersSlice: StateCreator<AdminStore, [], [], ServersSlice> = (set): ServersSlice => ({
  servers: getEmptyPaginationSet<z.infer<typeof adminServerSchema>>(),
  serverAllocations: getEmptyPaginationSet<z.infer<typeof serverAllocationSchema>>(),
  serverVariables: [],
  serverMounts: getEmptyPaginationSet<z.infer<typeof adminServerMountSchema>>(),

  setServers: (value) => set((state) => ({ ...state, servers: value })),
  addServer: (server) =>
    set((state) => ({
      servers: {
        ...state.servers,
        data: [...state.servers.data, server],
        total: state.servers.total + 1,
      },
    })),
  removeServer: (server) =>
    set((state) => ({
      servers: {
        ...state.servers,
        data: state.servers.data.filter((s) => s.uuid !== server.uuid),
        total: state.servers.total - 1,
      },
    })),
  updateServer: (server) =>
    set((state) => ({
      servers: {
        ...state.servers,
        data: state.servers.data.map((s) => (s.uuid === server.uuid ? server : s)),
      },
    })),

  setServerAllocations: (value) => set((state) => ({ ...state, serverAllocations: value })),
  addServerAllocation: (allocation) =>
    set((state) => ({
      serverAllocations: {
        ...state.serverAllocations,
        data: [...state.serverAllocations.data, allocation],
        total: state.serverAllocations.total + 1,
      },
    })),
  removeServerAllocation: (allocation) =>
    set((state) => ({
      serverAllocations: {
        ...state.serverAllocations,
        data: state.serverAllocations.data.filter((a) => a.uuid !== allocation.uuid),
        total: state.serverAllocations.total - 1,
      },
    })),

  setServerVariables: (serverVariables) => set((state) => ({ ...state, serverVariables })),
  updateServerVariable: (envVariable, updatedProps) =>
    set((state) => ({
      serverVariables: state.serverVariables.map((v) =>
        v.envVariable === envVariable ? { ...v, ...updatedProps } : v,
      ),
    })),

  setServerMounts: (value) => set((state) => ({ ...state, serverMounts: value })),
  addServerMount: (mount) =>
    set((state) => ({
      serverMounts: {
        ...state.serverMounts,
        data: [...state.serverMounts.data, mount],
        total: state.serverMounts.total + 1,
      },
    })),
  removeServerMount: (mount) =>
    set((state) => ({
      serverMounts: {
        ...state.serverMounts,
        data: state.serverMounts.data.filter((m) => m.mount.uuid !== mount.mount.uuid),
        total: state.serverMounts.total - 1,
      },
    })),
});

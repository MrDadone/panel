import { StateCreator } from 'zustand';
import { getEmptyPaginationSet } from '@/api/axios.ts';
import { ObjectSet } from '@/lib/objectSet.ts';
import { AdminStore } from '@/stores/admin.tsx';

export interface NodesSlice {
  nodes: Pagination<Node>;
  nodeMounts: Pagination<NodeMount>;
  nodeBackups: Pagination<AdminServerBackup>;
  nodeAllocations: Pagination<NodeAllocation>;
  selectedNodeAllocations: ObjectSet<NodeAllocation, 'uuid'>;

  setNodes: (nodes: Pagination<Node>) => void;
  addNode: (node: Node) => void;
  removeNode: (node: Node) => void;

  setNodeMounts: (mounts: Pagination<NodeMount>) => void;
  addNodeMount: (mount: NodeMount) => void;
  removeNodeMount: (mount: NodeMount) => void;

  setNodeBackups: (backups: Pagination<AdminServerBackup>) => void;
  removeNodeBackup: (backup: AdminServerBackup) => void;

  setNodeAllocations: (allocations: Pagination<NodeAllocation>) => void;
  removeNodeAllocations: (allocations: NodeAllocation[]) => void;

  setSelectedNodeAllocations: (allocations: NodeAllocation[]) => void;
  addSelectedNodeAllocation: (allocation: NodeAllocation) => void;
  removeSelectedNodeAllocation: (allocation: NodeAllocation) => void;
}

export const createNodesSlice: StateCreator<AdminStore, [], [], NodesSlice> = (set, get): NodesSlice => ({
  nodes: getEmptyPaginationSet<Node>(),
  nodeMounts: getEmptyPaginationSet<NodeMount>(),
  nodeBackups: getEmptyPaginationSet<AdminServerBackup>(),
  nodeAllocations: getEmptyPaginationSet<NodeAllocation>(),
  selectedNodeAllocations: new ObjectSet('uuid'),

  setNodes: (value) => set((state) => ({ ...state, nodes: value })),
  addNode: (node) =>
    set((state) => ({
      nodes: {
        ...state.nodes,
        data: [...state.nodes.data, node],
        total: state.nodes.total + 1,
      },
    })),
  removeNode: (node) =>
    set((state) => ({
      nodes: {
        ...state.nodes,
        data: state.nodes.data.filter((l) => l.uuid !== node.uuid),
        total: state.nodes.total - 1,
      },
    })),

  setNodeMounts: (value) => set((state) => ({ ...state, nodeMounts: value })),
  addNodeMount: (mount) =>
    set((state) => ({
      nodeMounts: {
        ...state.nodeMounts,
        data: [...state.nodeMounts.data, mount],
        total: state.nodeMounts.total + 1,
      },
    })),
  removeNodeMount: (mount) =>
    set((state) => ({
      nodeMounts: {
        ...state.nodeMounts,
        data: state.nodeMounts.data.filter((l) => l.mount.uuid !== mount.mount.uuid),
        total: state.nodeMounts.total - 1,
      },
    })),

  setNodeBackups: (value) => set((state) => ({ ...state, nodeBackups: value })),
  removeNodeBackup: (backup) =>
    set((state) => ({
      nodeBackups: {
        ...state.nodeBackups,
        data: state.nodeBackups.data.filter((b) => b.uuid !== backup.uuid),
        total: state.nodeBackups.total - 1,
      },
    })),

  setNodeAllocations: (value) => set((state) => ({ ...state, nodeAllocations: value })),
  removeNodeAllocations: (allocations) =>
    set((state) => ({
      nodeAllocations: {
        ...state.nodeAllocations,
        data: state.nodeAllocations.data.filter((a) => !allocations.some((al) => al.uuid === a.uuid)),
        total: state.nodeAllocations.total - allocations.length,
      },
    })),

  setSelectedNodeAllocations: (value) =>
    set((state) => ({ ...state, selectedNodeAllocations: new ObjectSet('uuid', value) })),
  addSelectedNodeAllocation: (value) =>
    set((state) => {
      const next = new ObjectSet('uuid', state.selectedNodeAllocations.values());
      next.add(value);
      return { ...state, selectedNodeAllocations: next };
    }),
  removeSelectedNodeAllocation: (value) =>
    set((state) => {
      const next = new ObjectSet('uuid', state.selectedNodeAllocations.values());
      next.delete(value);
      return { ...state, selectedNodeAllocations: next };
    }),
});

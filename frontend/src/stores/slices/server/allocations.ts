import { z } from 'zod';
import { StateCreator } from 'zustand';
import { getEmptyPaginationSet } from '@/api/axios.ts';
import { serverAllocationSchema } from '@/lib/schemas/server/allocations.ts';
import { ServerStore } from '@/stores/server.ts';

export interface AllocationsSlice {
  allocations: Pagination<z.infer<typeof serverAllocationSchema>>;

  setAllocations: (allocation: Pagination<z.infer<typeof serverAllocationSchema>>) => void;
  addAllocation: (allocation: z.infer<typeof serverAllocationSchema>) => void;
  removeAllocation: (allocation: z.infer<typeof serverAllocationSchema>) => void;
}

export const createAllocationsSlice: StateCreator<ServerStore, [], [], AllocationsSlice> = (set): AllocationsSlice => ({
  allocations: getEmptyPaginationSet<z.infer<typeof serverAllocationSchema>>(),

  setAllocations: (value) => set((state) => ({ ...state, allocations: value })),
  addAllocation: (allocation) =>
    set((state) => ({
      allocations: {
        ...state.allocations,
        data: [...state.allocations.data, allocation],
        total: state.allocations.total + 1,
      },
    })),
  removeAllocation: (allocation) =>
    set((state) => ({
      allocations: {
        ...state.allocations,
        data: state.allocations.data.filter((a) => a.uuid !== allocation.uuid),
        total: state.allocations.total - 1,
      },
    })),
});

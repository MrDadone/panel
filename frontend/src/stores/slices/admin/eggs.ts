import { z } from 'zod';
import { StateCreator } from 'zustand';
import { getEmptyPaginationSet } from '@/api/axios.ts';
import { adminEggSchema, adminEggVariableSchema } from '@/lib/schemas/admin/eggs.ts';
import { adminNodeMountSchema } from '@/lib/schemas/admin/nodes.ts';
import { AdminStore } from '@/stores/admin.tsx';

export interface EggsSlice {
  eggs: Pagination<z.infer<typeof adminEggSchema>>;
  eggMounts: Pagination<z.infer<typeof adminNodeMountSchema>>;
  eggVariables: z.infer<typeof adminEggVariableSchema>[];

  setEggs: (eggs: Pagination<z.infer<typeof adminEggSchema>>) => void;
  addEgg: (egg: z.infer<typeof adminEggSchema>) => void;
  removeEgg: (egg: z.infer<typeof adminEggSchema>) => void;

  setEggMounts: (mounts: Pagination<z.infer<typeof adminNodeMountSchema>>) => void;
  addEggMount: (mount: z.infer<typeof adminNodeMountSchema>) => void;
  removeEggMount: (mount: z.infer<typeof adminNodeMountSchema>) => void;

  setEggVariables: (variables: z.infer<typeof adminEggVariableSchema>[]) => void;
  addEggVariable: (variables: z.infer<typeof adminEggVariableSchema>) => void;
  removeEggVariable: (variables: z.infer<typeof adminEggVariableSchema>) => void;
}

export const createEggsSlice: StateCreator<AdminStore, [], [], EggsSlice> = (set): EggsSlice => ({
  eggs: getEmptyPaginationSet<z.infer<typeof adminEggSchema>>(),
  eggMounts: getEmptyPaginationSet<z.infer<typeof adminNodeMountSchema>>(),
  eggVariables: [],

  setEggs: (value) => set((state) => ({ ...state, eggs: value })),
  addEgg: (egg) =>
    set((state) => ({
      eggs: {
        ...state.eggs,
        data: [...state.eggs.data, egg],
        total: state.eggs.total + 1,
      },
    })),
  removeEgg: (egg) =>
    set((state) => ({
      eggs: {
        ...state.eggs,
        data: state.eggs.data.filter((e) => e.uuid !== egg.uuid),
        total: state.eggs.total - 1,
      },
    })),

  setEggMounts: (value) => set((state) => ({ ...state, eggMounts: value })),
  addEggMount: (mount) =>
    set((state) => ({
      eggMounts: {
        ...state.eggMounts,
        data: [...state.eggMounts.data, mount],
        total: state.eggMounts.total + 1,
      },
    })),
  removeEggMount: (mount) =>
    set((state) => ({
      eggMounts: {
        ...state.eggMounts,
        data: state.eggMounts.data.filter((m) => m.mount.uuid !== mount.mount.uuid),
        total: state.eggMounts.total - 1,
      },
    })),

  setEggVariables: (value) => set((state) => ({ ...state, eggVariables: value })),
  addEggVariable: (variable) =>
    set((state) => ({
      eggVariables: [variable, ...state.eggVariables],
    })),
  removeEggVariable: (variable) =>
    set((state) => ({
      eggVariables: state.eggVariables.filter((v) => v.uuid !== variable.uuid),
    })),
});

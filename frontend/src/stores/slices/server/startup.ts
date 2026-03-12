import { z } from 'zod';
import { StateCreator } from 'zustand';
import { serverVariableSchema } from '@/lib/schemas/server/startup.ts';
import { ServerStore } from '@/stores/server.ts';

export interface StartupSlice {
  variables: z.infer<typeof serverVariableSchema>[];

  setVariables: (variables: z.infer<typeof serverVariableSchema>[]) => void;
  updateVariable: (envVariable: string, updatedProps: Partial<z.infer<typeof serverVariableSchema>>) => void;
}

export const createStartupSlice: StateCreator<ServerStore, [], [], StartupSlice> = (set): StartupSlice => ({
  variables: [],

  setVariables: (variables) => set((state) => ({ ...state, variables })),
  updateVariable: (envVariable, updatedProps) =>
    set((state) => ({
      variables: state.variables.map((v) => (v.envVariable === envVariable ? { ...v, ...updatedProps } : v)),
    })),
});

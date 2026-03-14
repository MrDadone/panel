import { z } from 'zod';
import { StateCreator } from 'zustand';
import { serverImagePullProgressSchema, serverSchema } from '@/lib/schemas/server/server.ts';
import { ServerStore } from '@/stores/server.ts';

export interface ServerSlice {
  server: z.infer<typeof serverSchema>;

  imagePulls: Map<string, z.infer<typeof serverImagePullProgressSchema>>;

  setServer: (server: z.infer<typeof serverSchema>) => void;
  updateServer: (updatedProps: Partial<z.infer<typeof serverSchema>>) => void;

  setImagePull: (id: string, pull: z.infer<typeof serverImagePullProgressSchema>) => void;
  removeImagePull: (id: string) => void;
  clearImagePulls: () => void;
}

export const createServerSlice: StateCreator<ServerStore, [], [], ServerSlice> = (set): ServerSlice => ({
  server: {} as z.infer<typeof serverSchema>,

  imagePulls: new Map<string, z.infer<typeof serverImagePullProgressSchema>>(),

  setServer: (value) => set((state) => ({ ...state, server: value })),
  updateServer: (updatedProps) =>
    set((state) => ({
      server: { ...state.server, ...updatedProps },
    })),

  setImagePull: (uuid, progress) =>
    set((state) => {
      const prev = new Map(state.imagePulls);
      state.imagePulls.set(uuid, progress);
      return { ...state, imagePulls: prev };
    }),
  removeImagePull: (uuid) =>
    set((state) => {
      const prev = new Map(state.imagePulls);
      state.imagePulls.delete(uuid);
      return { ...state, imagePulls: prev };
    }),
  clearImagePulls: () =>
    set(() => {
      return { imagePulls: new Map<string, z.infer<typeof serverImagePullProgressSchema>>() };
    }),
});

import { StateCreator } from 'zustand';
import { ServerStore } from '@/stores/server.ts';

export interface ServerSlice {
  server: Server;

  imagePulls: Map<string, ImagePullProgress>;

  setServer: (server: Server) => void;
  updateServer: (updatedProps: Partial<Server>) => void;

  setImagePull: (id: string, pull: ImagePullProgress) => void;
  removeImagePull: (id: string) => void;
  clearImagePulls: () => void;
}

export const createServerSlice: StateCreator<ServerStore, [], [], ServerSlice> = (set): ServerSlice => ({
  server: {} as Server,

  imagePulls: new Map<string, ImagePullProgress>(),

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
      return { imagePulls: new Map<string, ImagePullProgress>() };
    }),
});

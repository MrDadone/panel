import { StateCreator } from 'zustand';
import { ServerStore } from '@/stores/server.ts';

export interface FilesSlice {
  fileOperations: Map<string, FileOperation>;
  setFileOperation: (uuid: string, operation: FileOperation) => void;
  removeFileOperation: (uuid: string) => void;
}

export const createFilesSlice: StateCreator<ServerStore, [], [], FilesSlice> = (set, get): FilesSlice => ({
  fileOperations: new Map<string, FileOperation>(),
  setFileOperation: (uuid, operation) =>
    set((state) => {
      const newMap = new Map(state.fileOperations);
      newMap.set(uuid, operation);
      return { ...state, fileOperations: newMap };
    }),
  removeFileOperation: (uuid) =>
    set((state) => {
      const newMap = new Map(state.fileOperations);
      newMap.delete(uuid);
      return { ...state, fileOperations: newMap };
    }),
});

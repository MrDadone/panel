import { z } from 'zod';
import { StateCreator } from 'zustand';
import { serverFileOperationSchema } from '@/lib/schemas/server/files.ts';
import { ServerStore } from '@/stores/server.ts';

export interface FilesSlice {
  fileOperations: Map<string, z.infer<typeof serverFileOperationSchema>>;
  setFileOperation: (uuid: string, operation: z.infer<typeof serverFileOperationSchema>) => void;
  removeFileOperation: (uuid: string) => void;
}

export const createFilesSlice: StateCreator<ServerStore, [], [], FilesSlice> = (set, get): FilesSlice => ({
  fileOperations: new Map<string, z.infer<typeof serverFileOperationSchema>>(),
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

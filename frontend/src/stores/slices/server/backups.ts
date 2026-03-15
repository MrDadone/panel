import { z } from 'zod';
import { StateCreator } from 'zustand';
import { getEmptyPaginationSet } from '@/api/axios.ts';
import { serverBackupWithProgressSchema } from '@/lib/schemas/server/backups.ts';
import { ServerStore } from '@/stores/server.ts';

export interface BackupsSlice {
  backups: Pagination<z.infer<typeof serverBackupWithProgressSchema>>;

  setBackups: (backups: Pagination<z.infer<typeof serverBackupWithProgressSchema>>) => void;
  addBackup: (backups: z.infer<typeof serverBackupWithProgressSchema>) => void;
  removeBackup: (backups: z.infer<typeof serverBackupWithProgressSchema>) => void;
  updateBackup: (uuid: string, updatedProps: Partial<z.infer<typeof serverBackupWithProgressSchema>>) => void;
  setBackupProgress: (uuid: string, progress: number, total: number) => void;

  backupRestoreProgress: number;
  backupRestoreTotal: number;

  setBackupRestoreProgress: (progress: number, total: number) => void;
}

export const createBackupsSlice: StateCreator<ServerStore, [], [], BackupsSlice> = (set): BackupsSlice => ({
  backups: getEmptyPaginationSet<z.infer<typeof serverBackupWithProgressSchema>>(),

  setBackups: (value) => set((state) => ({ ...state, backups: value })),
  addBackup: (backup) =>
    set((state) => ({
      backups: {
        ...state.backups,
        data: [...state.backups.data, backup],
        total: state.backups.total + 1,
      },
    })),
  removeBackup: (backup) =>
    set((state) => ({
      backups: {
        ...state.backups,
        data: state.backups.data.filter((b) => b.uuid !== backup.uuid),
        total: state.backups.total - 1,
      },
    })),
  updateBackup: (uuid, updatedProps) =>
    set((state) => ({
      backups: {
        ...state.backups,
        data: state.backups.data.map((b) => (b.uuid === uuid ? { ...b, ...updatedProps } : b)),
      },
    })),
  setBackupProgress: (uuid, progress, total) =>
    set((state) => ({
      backups: {
        ...state.backups,
        data: state.backups.data.map((b) => (b.uuid === uuid ? { ...b, progress: { progress, total } } : b)),
      },
    })),

  backupRestoreProgress: 0,
  backupRestoreTotal: 0,

  setBackupRestoreProgress: (progress, total) =>
    set((state) => ({ ...state, backupRestoreProgress: progress, backupRestoreTotal: total })),
});

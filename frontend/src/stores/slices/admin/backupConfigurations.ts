import { z } from 'zod';
import { StateCreator } from 'zustand';
import { getEmptyPaginationSet } from '@/api/axios.ts';
import { adminBackupConfigurationSchema } from '@/lib/schemas/admin/backupConfigurations.ts';
import { AdminStore } from '@/stores/admin.tsx';

export interface BackupConfigurationsSlice {
  backupConfigurations: Pagination<z.infer<typeof adminBackupConfigurationSchema>>;

  setBackupConfigurations: (backupConfigurations: Pagination<z.infer<typeof adminBackupConfigurationSchema>>) => void;
  addBackupConfiguration: (backupConfigurations: z.infer<typeof adminBackupConfigurationSchema>) => void;
  removeBackupConfiguration: (backupConfigurations: z.infer<typeof adminBackupConfigurationSchema>) => void;
}

export const createBackupConfigurationsSlice: StateCreator<AdminStore, [], [], BackupConfigurationsSlice> = (
  set,
): BackupConfigurationsSlice => ({
  backupConfigurations: getEmptyPaginationSet<z.infer<typeof adminBackupConfigurationSchema>>(),

  setBackupConfigurations: (value) => set((state) => ({ ...state, backupConfigurations: value })),
  addBackupConfiguration: (backupConfiguration) =>
    set((state) => ({
      backupConfigurations: {
        ...state.backupConfigurations,
        data: [...state.backupConfigurations.data, backupConfiguration],
        total: state.backupConfigurations.total + 1,
      },
    })),
  removeBackupConfiguration: (backupConfiguration) =>
    set((state) => ({
      backupConfigurations: {
        ...state.backupConfigurations,
        data: state.backupConfigurations.data.filter((bc) => bc.uuid !== backupConfiguration.uuid),
        total: state.backupConfigurations.total - 1,
      },
    })),
});

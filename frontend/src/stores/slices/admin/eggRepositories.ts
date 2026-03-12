import { z } from 'zod';
import { StateCreator } from 'zustand';
import { getEmptyPaginationSet } from '@/api/axios.ts';
import { adminEggRepositorySchema } from '@/lib/schemas/admin/eggRepositories.ts';
import { AdminStore } from '@/stores/admin.tsx';

export interface EggRepositoriesSlice {
  eggRepositories: Pagination<z.infer<typeof adminEggRepositorySchema>>;

  setEggRepositories: (eggRepositories: Pagination<z.infer<typeof adminEggRepositorySchema>>) => void;
  addEggRepository: (eggRepository: z.infer<typeof adminEggRepositorySchema>) => void;
  removeEggRepository: (eggRepository: z.infer<typeof adminEggRepositorySchema>) => void;
}

export const createEggRepositoriesSlice: StateCreator<AdminStore, [], [], EggRepositoriesSlice> = (
  set,
): EggRepositoriesSlice => ({
  eggRepositories: getEmptyPaginationSet<z.infer<typeof adminEggRepositorySchema>>(),
  setEggRepositories: (value) => set((state) => ({ ...state, eggRepositories: value })),
  addEggRepository: (eggRepository) =>
    set((state) => ({
      eggRepositories: {
        ...state.eggRepositories,
        data: [...state.eggRepositories.data, eggRepository],
        total: state.eggRepositories.total + 1,
      },
    })),
  removeEggRepository: (eggRepository) =>
    set((state) => ({
      eggRepositories: {
        ...state.eggRepositories,
        data: state.eggRepositories.data.filter((n) => n.uuid !== eggRepository.uuid),
        total: state.eggRepositories.total - 1,
      },
    })),
});

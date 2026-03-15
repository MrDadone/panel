import { StateCreator } from 'zustand';
import { ServerStore } from '@/stores/server.ts';

export interface TransferSlice {
  transferProgressArchive: number;
  transferProgressNetwork: number;
  transferProgressTotal: number;

  setTransferProgress: (progressArchive: number, progressNetwork: number, total: number) => void;
}

export const createTransferSlice: StateCreator<ServerStore, [], [], TransferSlice> = (set): TransferSlice => ({
  transferProgressArchive: 0,
  transferProgressNetwork: 0,
  transferProgressTotal: 0,

  setTransferProgress: (progressArchive, progressNetwork, total) =>
    set((state) => ({
      ...state,
      transferProgressArchive: progressArchive,
      transferProgressNetwork: progressNetwork,
      transferProgressTotal: total,
    })),
});

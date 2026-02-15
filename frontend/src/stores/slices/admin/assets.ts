import { StateCreator } from 'zustand';
import { getEmptyPaginationSet } from '@/api/axios.ts';
import { AdminStore } from '@/stores/admin.tsx';

export interface AssetsSlice {
  assets: ResponseMeta<StorageAsset>;
  selectedAssets: string[];

  setAssets: (assets: ResponseMeta<StorageAsset>) => void;
  addAssets: (assets: StorageAsset[]) => void;
  uploadAsset: (asset: StorageAsset) => void;
  removeAssets: (assets: string[]) => void;

  setSelectedAssets: (assets: string[]) => void;
  addSelectedAsset: (asset: StorageAsset) => void;
  removeSelectedAsset: (asset: StorageAsset) => void;
}

export const createAssetsSlice: StateCreator<AdminStore, [], [], AssetsSlice> = (set): AssetsSlice => ({
  assets: getEmptyPaginationSet<StorageAsset>(),
  selectedAssets: [],

  setAssets: (value) => set((state) => ({ ...state, assets: value })),
  addAssets: (assets) =>
    set((state) => ({
      ...state,
      assets: {
        ...state.assets,
        data: [...state.assets.data.filter((n) => !assets.some((as) => as.name === n.name)), ...assets],
      },
    })),
  uploadAsset: (asset) =>
    set((state) => ({
      assets: {
        ...state.assets,
        data: [...state.assets.data.filter((n) => n.name !== asset.name), asset],
        total: state.assets.total + 1,
      },
    })),
  removeAssets: (assets) =>
    set((state) => ({
      assets: {
        ...state.assets,
        data: state.assets.data.filter((n) => !assets.some((as) => as === n.name)),
        total: state.assets.total - 1,
      },
    })),

  setSelectedAssets: (value) => set((state) => ({ ...state, selectedAssets: value })),
  addSelectedAsset: (value) =>
    set((state) => {
      if (state.selectedAssets.every((a) => a !== value.name)) {
        return { ...state, selectedAssets: [...state.selectedAssets, value.name] };
      }

      return { ...state };
    }),
  removeSelectedAsset: (value) =>
    set((state) => {
      return { ...state, selectedAssets: state.selectedAssets.filter((a) => a !== value.name) };
    }),
});

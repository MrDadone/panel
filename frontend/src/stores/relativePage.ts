import { create, StoreApi } from 'zustand';
import { createContext } from 'zustand-utils';
import { createDocumentSlice, DocumentSlice } from '@/stores/slices/relativePage/document.ts';

export interface RelativePageStore extends DocumentSlice {
  reset: () => void;
}

const { Provider, useStore } = createContext<StoreApi<RelativePageStore>>();

export const createRelativePageStore = () =>
  create<RelativePageStore>()((...a) => {
    const initialState = {} as RelativePageStore;
    Object.assign(initialState, {
      ...createDocumentSlice(...a),
    });
    initialState.reset = () => a[0]((state) => ({ ...initialState, reset: state.reset }), true);
    return initialState;
  });

export const RelativePageStoreContextProvider = Provider;
export const useRelativePageStore = useStore;

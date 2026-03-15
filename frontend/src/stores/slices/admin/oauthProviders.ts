import { z } from 'zod';
import { StateCreator } from 'zustand';
import { getEmptyPaginationSet } from '@/api/axios.ts';
import { adminOAuthProviderSchema } from '@/lib/schemas/admin/oauthProviders.ts';
import { AdminStore } from '@/stores/admin.tsx';

export interface OAuthProvidersSlice {
  oauthProviders: Pagination<z.infer<typeof adminOAuthProviderSchema>>;

  setOAuthProviders: (oauthProviders: Pagination<z.infer<typeof adminOAuthProviderSchema>>) => void;
  addOAuthProvider: (oauthProvider: z.infer<typeof adminOAuthProviderSchema>) => void;
  removeOAuthProvider: (oauthProvider: z.infer<typeof adminOAuthProviderSchema>) => void;
}

export const createOAuthProvidersSlice: StateCreator<AdminStore, [], [], OAuthProvidersSlice> = (
  set,
): OAuthProvidersSlice => ({
  oauthProviders: getEmptyPaginationSet<z.infer<typeof adminOAuthProviderSchema>>(),

  setOAuthProviders: (value) => set((state) => ({ ...state, oauthProviders: value })),
  addOAuthProvider: (oauthProvider) =>
    set((state) => ({
      oauthProviders: {
        ...state.oauthProviders,
        data: [...state.oauthProviders.data, oauthProvider],
        total: state.oauthProviders.total + 1,
      },
    })),
  removeOAuthProvider: (oauthProvider) =>
    set((state) => ({
      oauthProviders: {
        ...state.oauthProviders,
        data: state.oauthProviders.data.filter((dh) => dh.uuid !== oauthProvider.uuid),
        total: state.oauthProviders.total - 1,
      },
    })),
});

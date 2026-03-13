import { z } from 'zod';
import { StateCreator } from 'zustand';
import { getEmptyPaginationSet } from '@/api/axios.ts';
import { userOAuthLinkSchema } from '@/lib/schemas/user/oAuth.ts';
import { UserStore } from '@/stores/user.ts';

export interface OAuthLinksSlice {
  oauthLinks: Pagination<z.infer<typeof userOAuthLinkSchema>>;

  setOAuthLinks: (links: Pagination<z.infer<typeof userOAuthLinkSchema>>) => void;
  removeOAuthLink: (link: z.infer<typeof userOAuthLinkSchema>) => void;
}

export const createOAuthLinksSlice: StateCreator<UserStore, [], [], OAuthLinksSlice> = (set): OAuthLinksSlice => ({
  oauthLinks: getEmptyPaginationSet<z.infer<typeof userOAuthLinkSchema>>(),

  setOAuthLinks: (value) => set((state) => ({ ...state, oauthLinks: value })),
  removeOAuthLink: (link) =>
    set((state) => ({
      oauthLinks: {
        ...state.oauthLinks,
        data: state.oauthLinks.data.filter((k) => k.uuid !== link.uuid),
        total: state.oauthLinks.total - 1,
      },
    })),
});

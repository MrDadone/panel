import { z } from 'zod';
import { StateCreator } from 'zustand';
import { getEmptyPaginationSet } from '@/api/axios.ts';
import { adminFullUserSchema, adminUserOAuthLinkSchema } from '@/lib/schemas/admin/users.ts';
import { AdminStore } from '@/stores/admin.tsx';

export interface UsersSlice {
  users: Pagination<z.infer<typeof adminFullUserSchema>>;
  userOAuthLinks: Pagination<z.infer<typeof adminUserOAuthLinkSchema>>;

  setUsers: (users: Pagination<z.infer<typeof adminFullUserSchema>>) => void;
  addUser: (user: z.infer<typeof adminFullUserSchema>) => void;
  removeUser: (user: z.infer<typeof adminFullUserSchema>) => void;

  setUserOAuthLinks: (links: Pagination<z.infer<typeof adminUserOAuthLinkSchema>>) => void;
  addUserOAuthLink: (link: z.infer<typeof adminUserOAuthLinkSchema>) => void;
  removeUserOAuthLink: (link: z.infer<typeof adminUserOAuthLinkSchema>) => void;
}

export const createUsersSlice: StateCreator<AdminStore, [], [], UsersSlice> = (set): UsersSlice => ({
  users: getEmptyPaginationSet<z.infer<typeof adminFullUserSchema>>(),
  userOAuthLinks: getEmptyPaginationSet<z.infer<typeof adminUserOAuthLinkSchema>>(),

  setUsers: (value) => set((state) => ({ ...state, users: value })),
  addUser: (user) =>
    set((state) => ({
      users: {
        ...state.users,
        data: [...state.users.data, user],
        total: state.users.total + 1,
      },
    })),
  removeUser: (user) =>
    set((state) => ({
      users: {
        ...state.users,
        data: state.users.data.filter((u) => u.uuid !== user.uuid),
        total: state.users.total - 1,
      },
    })),

  setUserOAuthLinks: (value) => set((state) => ({ ...state, userOAuthLinks: value })),
  addUserOAuthLink: (link) =>
    set((state) => ({
      userOAuthLinks: {
        ...state.userOAuthLinks,
        data: [...state.userOAuthLinks.data, link],
        total: state.userOAuthLinks.total + 1,
      },
    })),
  removeUserOAuthLink: (link) =>
    set((state) => ({
      userOAuthLinks: {
        ...state.userOAuthLinks,
        data: state.userOAuthLinks.data.filter((u) => u.uuid !== link.uuid),
        total: state.userOAuthLinks.total - 1,
      },
    })),
});

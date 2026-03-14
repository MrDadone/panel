import { z } from 'zod';
import { StateCreator } from 'zustand';
import { getEmptyPaginationSet } from '@/api/axios.ts';
import { userSessionSchema } from '@/lib/schemas/user/sessions.ts';
import { UserStore } from '@/stores/user.ts';

export interface SessionSlice {
  sessions: Pagination<z.infer<typeof userSessionSchema>>;

  setSessions: (sessions: Pagination<z.infer<typeof userSessionSchema>>) => void;
  removeSession: (session: z.infer<typeof userSessionSchema>) => void;
}

export const createSessionsSlice: StateCreator<UserStore, [], [], SessionSlice> = (set): SessionSlice => ({
  sessions: getEmptyPaginationSet<z.infer<typeof userSessionSchema>>(),

  setSessions: (value) => set((state) => ({ ...state, sessions: value })),

  removeSession: (sess) =>
    set((state) => ({
      sessions: {
        ...state.sessions,
        data: state.sessions.data.filter((s) => s.uuid !== sess.uuid),
        total: state.sessions.total - 1,
      },
    })),
});

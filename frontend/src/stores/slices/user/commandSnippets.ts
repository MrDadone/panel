import { z } from 'zod';
import { StateCreator } from 'zustand';
import { getEmptyPaginationSet } from '@/api/axios.ts';
import { userCommandSnippetSchema } from '@/lib/schemas/user/commandSnippets.ts';
import { UserStore } from '@/stores/user.ts';

export interface CommandSnippetsSlice {
  commandSnippets: Pagination<z.infer<typeof userCommandSnippetSchema>>;

  setCommandSnippets: (snippets: Pagination<z.infer<typeof userCommandSnippetSchema>>) => void;
  addCommandSnippet: (snippet: z.infer<typeof userCommandSnippetSchema>) => void;
  removeCommandSnippet: (snippet: z.infer<typeof userCommandSnippetSchema>) => void;
  updateCommandSnippet: (uuid: string, data: Partial<z.infer<typeof userCommandSnippetSchema>>) => void;
}

export const createCommandSnippetsSlice: StateCreator<UserStore, [], [], CommandSnippetsSlice> = (
  set,
): CommandSnippetsSlice => ({
  commandSnippets: getEmptyPaginationSet<z.infer<typeof userCommandSnippetSchema>>(),

  setCommandSnippets: (value) => set((state) => ({ ...state, commandSnippets: value })),
  addCommandSnippet: (snippet) =>
    set((state) => ({
      commandSnippets: {
        ...state.commandSnippets,
        data: [...state.commandSnippets.data, snippet],
        total: state.commandSnippets.total + 1,
      },
    })),
  removeCommandSnippet: (snippet) =>
    set((state) => ({
      commandSnippets: {
        ...state.commandSnippets,
        data: state.commandSnippets.data.filter((s) => s.uuid !== snippet.uuid),
        total: state.commandSnippets.total - 1,
      },
    })),
  updateCommandSnippet: (uuid, data) =>
    set((state) => ({
      commandSnippets: {
        ...state.commandSnippets,
        data: state.commandSnippets.data.map((s) => (s.uuid === uuid ? { ...s, ...data } : s)),
      },
    })),
});

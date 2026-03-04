import type { History } from 'history';
import { createContext, useContext } from 'react';

export const HistoryContext = createContext<History | undefined>(undefined);

export const useHistory = () => {
  const context = useContext(HistoryContext);
  return context;
};

import { createContext, useContext } from 'react';

export interface AuthContextType {
  user: FullUser | null;
  impersonating: boolean;

  setUser: (user: FullUser | null) => void;
  doImpersonate: (user: FullUser) => void;
  doLogin: (user: FullUser, doNavigate?: boolean) => void;
  doLogout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within a AuthProvider');
  }
  return context;
};

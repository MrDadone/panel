import { createContext, useContext } from 'react';

export interface AuthContextType {
  user: User | null;

  setUser: (user: User | null) => void;
  doLogin: (user: User, doNavigate?: boolean) => void;
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

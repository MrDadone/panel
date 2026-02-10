import { ReactNode, startTransition, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { httpErrorToHuman } from '@/api/axios.ts';
import getMe from '@/api/me/getMe.ts';
import logout from '@/api/me/logout.ts';
import Spinner from '@/elements/Spinner.tsx';
import { AuthContext } from '@/providers/contexts/authContext.ts';
import { useToast } from './ToastProvider.tsx';
import { useTranslations } from './TranslationProvider.tsx';

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const { setToastPosition, addToast } = useToast();
  const { setLanguage } = useTranslations();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (user) {
      startTransition(() => {
        setToastPosition(user.toastPosition);
        setLanguage(user.language);
      });
    }
  }, [user, setToastPosition, setLanguage]);

  useEffect(() => {
    getMe()
      .then((user) => setUser(user))
      .catch(() => {
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const doLogin = (user: User, doNavigate: boolean = true) => {
    setUser(user);
    if (doNavigate) {
      navigate('/');
    }
  };

  const doLogout = () => {
    logout()
      .then(() => {
        setUser(null);
      })
      .catch((msg) => {
        addToast(httpErrorToHuman(msg), 'error');
      });
  };

  return (
    <AuthContext.Provider value={{ user, setUser, doLogin, doLogout }}>
      {loading ? <Spinner.Centered /> : children}
    </AuthContext.Provider>
  );
};

export { AuthProvider };
export { useAuth } from './contexts/authContext.ts';

import { FC, ReactNode, useCallback, useMemo } from 'react';
import { CurrentWindowContext } from '@/providers/contexts/currentWindowContext.ts';

const CurrentWindowProvider: FC<{ children: ReactNode; id: number | null }> = ({ children, id }) => {
  const getParent = useCallback(() => {
    if (!id) {
      return null;
    }

    return (document.getElementsByClassName(`window_${id}_card`) as HTMLCollectionOf<HTMLDivElement>)[0] || null;
  }, [id]);

  const contextValue = useMemo(
    () => ({
      id,
      getParent,
    }),
    [id, getParent],
  );

  return <CurrentWindowContext.Provider value={contextValue}>{children}</CurrentWindowContext.Provider>;
};

export { useCurrentWindow } from './contexts/currentWindowContext.ts';
export { CurrentWindowProvider };

import { FC, ReactNode, useCallback, useMemo } from 'react';
import { CurrentWindowContext } from '@/providers/contexts/currentWindowContext.ts';

const CurrentWindowProvider: FC<{ children: ReactNode; id: number | null }> = ({ children, id }) => {
  const getParent = useCallback(() => {
    if (!id) {
      return null;
    }

    return document.getElementById(`window_${id}_card`) as HTMLDivElement;
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

export { CurrentWindowProvider };
export { useCurrentWindow } from './contexts/currentWindowContext.ts';

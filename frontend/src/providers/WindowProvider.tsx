import { faX, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ActionIcon, Title } from '@mantine/core';
import { FC, ReactNode, startTransition, useCallback, useMemo, useState } from 'react';
import { Rnd } from 'react-rnd';
import Card from '@/elements/Card.tsx';
import { CurrentWindowProvider } from '@/providers/CurrentWindowProvider.tsx';
import { WindowContext } from '@/providers/contexts/windowContext.ts';

interface WindowType {
  id: number;
  icon: IconDefinition | undefined;
  title: string | undefined;
  component: ReactNode;
  zIndex: number;
}

let windowId = 1;

const WindowProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [windows, setWindows] = useState<WindowType[]>([]);
  const [maxZIndex, setMaxZIndex] = useState(100);

  const closeWindow = useCallback((id: number) => {
    setWindows((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addWindow = useCallback(
    (icon: IconDefinition | undefined, title: string | undefined, component: ReactNode) => {
      const id = windowId++;

      startTransition(() => {
        setMaxZIndex((prev) => prev + 1);
        setWindows((prev) => [...prev, { id, icon, title, component, zIndex: maxZIndex + 1 }]);
      });

      return id;
    },
    [maxZIndex],
  );

  const updateWindow = useCallback((id: number, title: string | undefined) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, title } : w)));
  }, []);

  const bringToFront = useCallback(
    (id: number) => {
      startTransition(() => {
        setWindows((prev) => {
          const window = prev.find((w) => w.id === id);
          if (!window) return prev;

          const isOnTop = prev.every((w) => w.id === id || w.zIndex < window.zIndex);
          if (isOnTop) return prev;

          const newZIndex = maxZIndex + 1;
          setMaxZIndex(newZIndex);

          return prev.map((w) => (w.id === id ? { ...w, zIndex: newZIndex } : w));
        });
      });
    },
    [maxZIndex],
  );

  const contextValue = useMemo(
    () => ({
      addWindow,
      updateWindow,
      closeWindow,
    }),
    [addWindow, updateWindow, closeWindow],
  );

  return (
    <WindowContext.Provider value={contextValue}>
      {children}
      {windows.map((w) => (
        <Rnd
          key={`window_${w.id}`}
          default={{
            x: window.innerWidth / 4,
            y: window.innerHeight / 4,
            width: window.innerWidth / 2,
            height: window.innerHeight / 2,
          }}
          minWidth={window.innerWidth / 4}
          minHeight={window.innerHeight / 8}
          bounds='body'
          dragHandleClassName={`window_${w.id}_drag`}
          style={{ zIndex: w.zIndex }}
          onMouseDown={() => bringToFront(w.id)}
          enableResizing={{
            left: true,
            right: true,
            top: true,
            bottom: true,
            bottomLeft: true,
            bottomRight: true,
            topLeft: true,
            topRight: true,
          }}
        >
          <Card p='sm' shadow='xl' className='h-full' id={`window_${w.id}_card`}>
            <div className={`window_${w.id}_drag flex flex-row justify-between items-center cursor-grab`}>
              <Title order={3}>
                {w.icon && <FontAwesomeIcon icon={w.icon} />} {w.title}
              </Title>
              <div className='flex flex-row'>
                <ActionIcon
                  variant='subtle'
                  onClick={(e) => {
                    e.stopPropagation();
                    closeWindow(w.id);
                  }}
                >
                  <FontAwesomeIcon icon={faX} />
                </ActionIcon>
              </div>
            </div>
            <CurrentWindowProvider id={w.id}>{w.component}</CurrentWindowProvider>
          </Card>
        </Rnd>
      ))}
    </WindowContext.Provider>
  );
};

export { WindowProvider };
export { useWindows } from './contexts/windowContext.ts';

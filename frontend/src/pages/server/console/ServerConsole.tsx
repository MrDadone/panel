import Console from './Console';
import Spinner from '@/elements/Spinner';
import ServerDetails from './ServerDetails';
import ServerPowerControls from './ServerPowerControls';
import ServerStats from './ServerStats';
import { useServerStore } from '@/stores/server';
import Can from '@/elements/Can';
import { Group, Title } from '@mantine/core';
import { useEffect, useRef, useState } from 'react';
import debounce from 'debounce';

export default () => {
  const server = useServerStore((state) => state.server);

  const [maxConsoleHeight, setMaxConsoleHeight] = useState<number | null>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (statsRef.current) {
      setMaxConsoleHeight(statsRef.current.clientHeight);

      const handleResize = debounce(() => {
        setMaxConsoleHeight(statsRef.current?.clientHeight || null);
      }, 100);

      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [statsRef.current]);

  console.log(maxConsoleHeight);

  return (
    <>
      <Group justify={'space-between'} mb={'md'}>
        <Title order={1} c={'white'}>
          {server.name}
        </Title>
        <Can action={['control.start', 'control.stop', 'control.restart']} matchAny>
          <ServerPowerControls />
        </Can>
      </Group>

      <div className={'grid xl:grid-cols-4 gap-4 mb-4'}>
        <div className={'xl:col-span-3'} style={{ maxHeight: maxConsoleHeight }}>
          <Spinner.Suspense>
            <Console />
          </Spinner.Suspense>
        </div>

        <div className={'h-fit'} ref={statsRef}>
          <ServerDetails />
        </div>
      </div>

      <ServerStats />
    </>
  );
};

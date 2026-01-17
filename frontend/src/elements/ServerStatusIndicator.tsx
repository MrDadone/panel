import { faPause, faPlay, faRefresh, faServer } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ActionIcon, Group } from '@mantine/core';
import { Radio } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { ServerCan } from '@/elements/Can.tsx';
import ConfirmationModal from '@/elements/modals/ConfirmationModal.tsx';
import { useTranslations } from '@/providers/TranslationProvider.tsx';
import { useServerStore } from '@/stores/server.ts';

const getServerStatusText = (state: ServerPowerState): string => {
  switch (state) {
    case 'running':
      return 'ONLINE';
    case 'starting':
      return 'STARTING';
    case 'stopping':
      return 'STOPPING';
    default:
      return 'OFFLINE';
  }
};

export default function ServerStatusIndicator() {
  const { t } = useTranslations();
  const params = useParams<'id'>();
  const [open, setOpen] = useState(false);
  const state = useServerStore((state) => state.state);
  const socketConnected = useServerStore((state) => state.socketConnected);
  const instance = useServerStore((state) => state.socketInstance);

  const killable = state === 'stopping';

  const onPowerAction = (action: ServerPowerAction | 'kill-confirmed') => {
    if (action === 'kill') {
      return setOpen(true);
    }

    if (instance) {
      setOpen(false);
      instance.send('set state', action === 'kill-confirmed' ? 'kill' : action);
    }
  };

  useEffect(() => {
    if (state === 'offline') {
      setOpen(false);
    }
  }, [state]);

  if (!params.id) {
    return null;
  }

  const isRunning = state === 'running';
  const canStart = state === 'offline';
  const canStop = state === 'running' || state === 'starting';


  return (
    <div className='flex flex-col gap-2 mt-2'>
      <div className='flex items-center justify-between gap-3'>
        {/* Power Controls */}
        <Group gap='xs'>
          <ServerCan action={['control.start', 'control.stop']} matchAny>
            <ActionIcon
              size='lg'
              radius='md'
              style={{
                backgroundColor: isRunning ? '#ef4444' : '#22c55e',
              }}
              className={isRunning ? 'hover:bg-red-600' : 'hover:bg-green-600'}
              variant='filled'
              disabled={!canStart && !canStop}
              loading={state === 'starting' || state === 'stopping'}
              onClick={() => onPowerAction(isRunning ? 'stop' : 'start')}
            >
              <FontAwesomeIcon 
                icon={isRunning ? faPause : faPlay} 
                className='text-white' 
                size='sm' 
              />
            </ActionIcon>
          </ServerCan>
          <ServerCan action='control.restart'>
            <ActionIcon
              size='lg'
              radius='md'
              style={{
                backgroundColor: '#eab308',
              }}
              className='hover:bg-yellow-600'
              variant='filled'
              disabled={state === 'offline'}
              onClick={() => onPowerAction('restart')}
            >
              <FontAwesomeIcon icon={faRefresh} className='text-white' size='sm' />
            </ActionIcon>
          </ServerCan>
        </Group>

        {/* Status Indicators */}
        <div className='flex flex-col gap-1.5 justify-center'>
          {/* Server Status */}
          <div className='flex items-center gap-1.5 text-xs'>
            <FontAwesomeIcon icon={faServer} className='w-3 h-3 text-white flex-shrink-0' style={{ minWidth: '12px' }} />
            <span className='font-medium text-white leading-none'>
              {getServerStatusText(state)}
            </span>
          </div>

          {/* WebSocket Connection Status */}
          <div className='flex items-center gap-1.5 text-xs'>
            <Radio className='w-3 h-3 text-white flex-shrink-0' style={{ minWidth: '12px' }} />
            <span className='font-medium text-white leading-none'>
              {socketConnected ? 'CONNECTED' : 'OFFLINE'}
            </span>
          </div>
        </div>
      </div>

      <ConfirmationModal
        opened={open}
        onClose={() => setOpen(false)}
        title={t('pages.server.console.power.modal.forceStop.title', {})}
        confirm={t('common.button.continue', {})}
        onConfirmed={() => onPowerAction('kill-confirmed')}
      >
        {t('pages.server.console.power.modal.forceStop.content', {})}
      </ConfirmationModal>
    </div>
  );
}

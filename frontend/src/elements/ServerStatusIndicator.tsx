import { faPlay, faRefresh, faServer, faStop } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ActionIcon, Group } from '@mantine/core';
import { Radio } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { ServerCan } from '@/elements/Can.tsx';
import ConfirmationModal from '@/elements/modals/ConfirmationModal.tsx';
import Tooltip from '@/elements/Tooltip.tsx';
import { useTranslations } from '@/providers/TranslationProvider.tsx';
import { useServerStore } from '@/stores/server.ts';

const getServerStatusText = (state: ServerPowerState, t: ReturnType<typeof useTranslations>['t']): string => {
  switch (state) {
    case 'running':
      return t('common.enum.serverState.running', {});
    case 'starting':
      return t('common.enum.serverState.starting', {});
    case 'stopping':
      return t('common.enum.serverState.stopping', {});
    default:
      return t('common.enum.serverState.offline', {});
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

  const isOffline = state === 'offline';

  const buttonAction = isOffline ? 'start' : killable ? 'kill' : 'stop';
  const buttonLabel = isOffline
    ? 'pages.server.console.power.start'
    : killable
      ? 'pages.server.console.power.kill'
      : 'pages.server.console.power.stop';
  const buttonColor = isOffline ? 'var(--color-server-action-start)' : 'var(--color-server-action-stop)';
  const buttonIcon = isOffline ? faPlay : faStop;

  return (
    <div className='flex flex-col gap-2 mt-2'>
      <div className='flex items-center justify-between gap-3'>
        <Group gap='xs'>
          <ServerCan action={['control.start', 'control.stop']} matchAny>
            <Tooltip label={t(buttonLabel, {})}>
              <ActionIcon
                size='lg'
                radius='md'
                style={{
                  backgroundColor: buttonColor,
                }}
                className='hover:opacity-90'
                variant='filled'
                onClick={() => onPowerAction(buttonAction)}
              >
                <FontAwesomeIcon icon={buttonIcon} className='text-white' size='sm' />
              </ActionIcon>
            </Tooltip>
          </ServerCan>
          <ServerCan action='control.restart'>
            <Tooltip label={t('pages.server.console.power.restart', {})}>
              <ActionIcon
                size='lg'
                radius='md'
                style={{
                  backgroundColor: 'var(--color-server-action-restart)',
                }}
                className='hover:opacity-90'
                variant='filled'
                disabled={state === 'offline'}
                onClick={() => onPowerAction('restart')}
              >
                <FontAwesomeIcon icon={faRefresh} className='text-white' size='sm' />
              </ActionIcon>
            </Tooltip>
          </ServerCan>
        </Group>

        <div className='flex flex-col gap-1.5 justify-center items-end'>
          <div className='flex items-center gap-1.5 text-xs'>
            <FontAwesomeIcon icon={faServer} className='w-3 h-3 text-white shrink-0' style={{ minWidth: '12px' }} />
            <span className='font-medium text-white leading-none'>{getServerStatusText(state, t)}</span>
          </div>

          <div className='flex items-center gap-1.5 text-xs'>
            <Radio className='w-3 h-3 text-white shrink-0' style={{ minWidth: '12px' }} />
            <span className='font-medium text-white leading-none'>
              {socketConnected
                ? t('common.enum.connectionStatus.connected', {})
                : t('common.enum.connectionStatus.offline', {})}
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

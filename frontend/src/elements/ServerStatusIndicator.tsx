import { faPlay, faRefresh, faSkull, faStop, faTowerBroadcast } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ActionIcon, Group } from '@mantine/core';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { ServerCan } from '@/elements/Can.tsx';
import ConfirmationModal from '@/elements/modals/ConfirmationModal.tsx';
import Tooltip from '@/elements/Tooltip.tsx';
import { statusToColor } from '@/lib/server.ts';
import { useTranslations } from '@/providers/TranslationProvider.tsx';
import { useServerStore } from '@/stores/server.ts';

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
  const buttonColor = isOffline ? 'green' : 'red';
  const buttonIcon = isOffline ? faPlay : killable ? faSkull : faStop;

  return (
    <div className='flex flex-col gap-2'>
      <div className='flex justify-start items-center gap-3'>
        <Group gap='xs'>
          <ServerCan action={['control.start', 'control.stop']} matchAny>
            <Tooltip label={t(buttonLabel, {})}>
              <ActionIcon size='lg' radius='md' color={buttonColor} onClick={() => onPowerAction(buttonAction)}>
                <FontAwesomeIcon icon={buttonIcon} size='sm' />
              </ActionIcon>
            </Tooltip>
          </ServerCan>
          <ServerCan action='control.restart'>
            <Tooltip label={t('pages.server.console.power.restart', {})}>
              <ActionIcon
                size='lg'
                radius='md'
                color='gray'
                disabled={state === 'offline'}
                onClick={() => onPowerAction('restart')}
              >
                <FontAwesomeIcon icon={faRefresh} size='sm' />
              </ActionIcon>
            </Tooltip>
          </ServerCan>
        </Group>

        <div className='flex flex-col gap-1.5 justify-center'>
          <div className='flex items-center gap-1.5 text-xs'>
            <span className={classNames('rounded-full size-4 animate-pulse', statusToColor(state))} />
            <span className='font-medium text-white leading-none'>{t(`common.enum.serverState.${state}`, {})}</span>
          </div>

          <div className='flex items-center gap-1.5 text-xs'>
            <FontAwesomeIcon
              icon={faTowerBroadcast}
              className={`${socketConnected ? 'animate-pulse text-green-500' : 'text-white'} w-4`}
            />
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

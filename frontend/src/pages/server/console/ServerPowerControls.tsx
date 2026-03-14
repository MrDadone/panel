import { useEffect, useState } from 'react';
import { z } from 'zod';
import Button from '@/elements/Button.tsx';
import { ServerCan } from '@/elements/Can.tsx';
import ConfirmationModal from '@/elements/modals/ConfirmationModal.tsx';
import { serverPowerAction } from '@/lib/schemas/server/server.ts';
import { useTranslations } from '@/providers/TranslationProvider.tsx';
import { useServerStore } from '@/stores/server.ts';

export default function ServerPowerControls() {
  const { t } = useTranslations();
  const [open, setOpen] = useState(false);
  const state = useServerStore((state) => state.state);
  const instance = useServerStore((state) => state.socketInstance);
  const socketConnected = useServerStore((state) => state.socketConnected);

  const killable = state === 'stopping';

  const onButtonClick = (action: z.infer<typeof serverPowerAction> | 'kill-confirmed') => {
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

  return (
    <div className='flex w-full md:w-fit gap-2'>
      <ConfirmationModal
        opened={open}
        onClose={() => setOpen(false)}
        title={t('pages.server.console.power.modal.forceStop.title', {})}
        confirm={t('common.button.continue', {})}
        onConfirmed={() => onButtonClick('kill-confirmed')}
      >
        {t('pages.server.console.power.modal.forceStop.content', {}).md()}
      </ConfirmationModal>

      {window.extensionContext.extensionRegistry.pages.server.console.powerButtonComponents.prependedComponents.map(
        (Component, i) => (
          <Component key={`console-powerbutton-prepended-${i}`} />
        ),
      )}

      <ServerCan action='control.start'>
        <Button
          color='green'
          disabled={!socketConnected || state !== 'offline'}
          loading={state === 'starting'}
          onClick={() => onButtonClick('start')}
          className='flex-1'
        >
          {t('pages.server.console.power.start', {})}
        </Button>
      </ServerCan>
      <ServerCan action='control.restart'>
        <Button
          color='gray'
          disabled={!socketConnected || !state}
          onClick={() => onButtonClick('restart')}
          className='flex-1'
        >
          {t('pages.server.console.power.restart', {})}
        </Button>
      </ServerCan>
      <ServerCan action='control.stop'>
        <Button
          color='red'
          disabled={!socketConnected || state === 'offline'}
          onClick={() => onButtonClick(killable ? 'kill' : 'stop')}
          className='flex-1'
        >
          {killable ? t('pages.server.console.power.kill', {}) : t('pages.server.console.power.stop', {})}
        </Button>
      </ServerCan>

      {window.extensionContext.extensionRegistry.pages.server.console.powerButtonComponents.appendedComponents.map(
        (Component, i) => (
          <Component key={`console-powerButton-appended-${i}`} />
        ),
      )}
    </div>
  );
}

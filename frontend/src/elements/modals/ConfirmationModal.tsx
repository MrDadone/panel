import { DefaultMantineColor, ModalProps } from '@mantine/core';
import { MouseEvent as ReactMouseEvent, ReactNode, useCallback, useState } from 'react';
import { useTranslations } from '@/providers/TranslationProvider.tsx';
import Button from '../Button.tsx';
import { Modal, ModalFooter } from './Modal.tsx';

type ConfirmationProps = Omit<ModalProps, 'children'> & {
  confirm?: string | undefined;
  confirmColor?: DefaultMantineColor;
  onConfirmed: (e: ReactMouseEvent<HTMLButtonElement, MouseEvent>) => void | Promise<void>;
  children: ReactNode;
};

export default function ConfirmationModal({
  confirm,
  confirmColor = 'red',
  onConfirmed,
  children,
  ...props
}: ConfirmationProps) {
  const { t } = useTranslations();

  const [loading, setLoading] = useState(false);

  const onConfirmedAlt = useCallback(
    (e: ReactMouseEvent<HTMLButtonElement, MouseEvent>) => {
      const res = onConfirmed(e);

      if (res instanceof Promise) {
        setLoading(true);

        Promise.resolve(res).finally(() => setLoading(false));
      }
    },
    [onConfirmed],
  );

  return (
    <Modal {...props}>
      {children}

      <ModalFooter>
        <Button color={confirmColor} loading={loading} onClick={onConfirmedAlt}>
          {confirm ?? t('common.button.okay', {})}
        </Button>
        <Button variant='default' onClick={props.onClose}>
          {t('common.button.cancel', {})}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

import { ModalProps } from '@mantine/core';
import { useMemo } from 'react';
import Button from '@/elements/Button.tsx';
import HljsCode from '@/elements/HljsCode.tsx';
import { Modal, ModalFooter } from '@/elements/modals/Modal.tsx';

export default function TelemetryPreviewModal({
  telemetry,
  opened,
  onClose,
}: ModalProps & { telemetry: object | null }) {
  const jsonLanguage = useMemo(() => () => import('highlight.js/lib/languages/json').then((m) => m.default), []);

  return (
    <Modal title='Telemetry Preview' onClose={onClose} opened={opened} size='lg'>
      <HljsCode languageName='json' language={jsonLanguage}>
        {JSON.stringify(telemetry, null, 2)}
      </HljsCode>

      <ModalFooter>
        <Button variant='default' onClick={onClose}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
}

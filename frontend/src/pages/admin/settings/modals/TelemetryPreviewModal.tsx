import { ModalProps } from '@mantine/core';
import Button from '@/elements/Button.tsx';
import HljsCode from '@/elements/HljsCode.tsx';
import Modal from '@/elements/modals/Modal.tsx';

export default function TelemetryPreviewModal({
  telemetry,
  opened,
  onClose,
}: ModalProps & { telemetry: object | null }) {
  return (
    <Modal title='Telemetry Preview' onClose={onClose} opened={opened} size='lg'>
      <HljsCode
        languageName='json'
        language={() => import('highlight.js/lib/languages/json').then((mod) => mod.default)}
      >
        {JSON.stringify(telemetry, null, 2)}
      </HljsCode>

      <Modal.Footer>
        <Button variant='default' onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

import { faInfo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ActionIcon } from '@mantine/core';
import { useMemo, useState } from 'react';
import Button from '../Button.tsx';
import HljsCode from '../HljsCode.tsx';
import Modal from '../modals/Modal.tsx';

export default function ActivityInfoButton({ activity }: { activity: AdminActivity | UserActivity | ServerActivity }) {
  const [openModal, setOpenModal] = useState<'view' | null>(null);

  const jsonLanguage = useMemo(() => () => import('highlight.js/lib/languages/json').then((m) => m.default), []);

  return (
    <>
      <Modal title='Activity Details' onClose={() => setOpenModal(null)} opened={openModal === 'view'}>
        <HljsCode languageName='json' language={jsonLanguage}>
          {JSON.stringify(activity.data, null, 2)}
        </HljsCode>

        <ModalFooter>
          <Button variant='default' onClick={() => setOpenModal(null)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>

      <ActionIcon onClick={() => setOpenModal('view')}>
        <FontAwesomeIcon icon={faInfo} />
      </ActionIcon>
    </>
  );
}

import { faInfo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ActionIcon, Group, Stack } from '@mantine/core';
import { useState } from 'react';
import Button from '../Button.tsx';
import HljsCode from '../HljsCode.tsx';
import Modal from '../modals/Modal.tsx';

export default function ActivityInfoButton({ activity }: { activity: ServerActivity | UserActivity }) {
  const [openModal, setOpenModal] = useState<'view' | null>(null);

  return (
    <>
      <Modal title='Activity Details' onClose={() => setOpenModal(null)} opened={openModal === 'view'}>
        <Stack>
          <HljsCode
            languageName='json'
            language={() => import('highlight.js/lib/languages/json').then((mod) => mod.default)}
          >
            {JSON.stringify(activity.data, null, 2)}
          </HljsCode>

          <Group>
            <Button variant='default' onClick={() => setOpenModal(null)}>
              Close
            </Button>
          </Group>
        </Stack>
      </Modal>

      <ActionIcon onClick={() => setOpenModal('view')}>
        <FontAwesomeIcon icon={faInfo} />
      </ActionIcon>
    </>
  );
}

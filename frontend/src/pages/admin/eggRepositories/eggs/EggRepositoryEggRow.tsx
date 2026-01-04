import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ActionIcon } from '@mantine/core';
import { useState } from 'react';
import { AdminCan } from '@/elements/Can.tsx';
import Code from '@/elements/Code.tsx';
import { TableData, TableRow } from '@/elements/Table.tsx';
import EggRepositoryEggsInstallModal from './modals/EggRepositoryEggsInstallModal.tsx';

export default function EggRepositoryEggRow({
  eggRepository,
  egg,
}: {
  eggRepository: AdminEggRepository;
  egg: AdminEggRepositoryEgg;
}) {
  const [openModal, setOpenModal] = useState<'install' | null>(null);

  return (
    <>
      <AdminCan action='nests.read'>
        <EggRepositoryEggsInstallModal
          eggRepository={eggRepository}
          egg={egg}
          opened={openModal === 'install'}
          onClose={() => setOpenModal(null)}
        />
      </AdminCan>

      <TableRow>
        <TableData>
          <Code>{egg.path}</Code>
        </TableData>

        <TableData>{egg.name}</TableData>

        <TableData>{egg.author}</TableData>

        <TableData>{egg.description}</TableData>

        <TableData>
          <AdminCan action='nests.read'>
            <ActionIcon onClick={() => setOpenModal('install')}>
              <FontAwesomeIcon icon={faDownload} />
            </ActionIcon>
          </AdminCan>
        </TableData>
      </TableRow>
    </>
  );
}

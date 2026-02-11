import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ActionIcon } from '@mantine/core';
import { forwardRef, memo, useState } from 'react';
import { AdminCan } from '@/elements/Can.tsx';
import Code from '@/elements/Code.tsx';
import Checkbox from '@/elements/input/Checkbox.tsx';
import { TableData, TableRow } from '@/elements/Table.tsx';
import EggRepositoryEggInstallModal from './modals/EggRepositoryEggInstallModal.tsx';

interface EggRepositoryEggRowProps {
  eggRepository: AdminEggRepository;
  egg: AdminEggRepositoryEgg;
  isSelected: boolean;
  onSelectionChange: (selected: boolean) => void;
}

const EggRepositoryEggRow = memo(
  forwardRef<HTMLTableRowElement, EggRepositoryEggRowProps>(function EggRepositoryEggRow(
    { eggRepository, egg, isSelected, onSelectionChange },
    ref,
  ) {
    const [openModal, setOpenModal] = useState<'install' | null>(null);

    return (
      <>
        <AdminCan action='nests.read'>
          <EggRepositoryEggInstallModal
            eggRepository={eggRepository}
            egg={egg}
            opened={openModal === 'install'}
            onClose={() => setOpenModal(null)}
          />
        </AdminCan>

        <TableRow bg={isSelected ? 'var(--mantine-color-blue-light)' : undefined} ref={ref}>
          <TableData className='pl-4 relative cursor-pointer w-10 text-center'>
            <Checkbox
              id={egg.uuid}
              checked={isSelected}
              onChange={(e) => {
                onSelectionChange(e.target.checked);
              }}
              onClick={(e) => e.stopPropagation()}
              classNames={{ input: 'cursor-pointer!' }}
            />
          </TableData>

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
  }),
);

export default EggRepositoryEggRow;

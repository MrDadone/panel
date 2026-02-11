import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import ActionBar from '@/elements/ActionBar.tsx';
import Button from '@/elements/Button.tsx';
import EggRepositoryEggsInstallModal from './modals/EggRepositoryEggsInstallModal.tsx';

export default function EggActionBar({
  eggRepository,
  selectedEggs,
  setSelectedEggs,
}: {
  eggRepository: AdminEggRepository;
  selectedEggs: Set<string>;
  setSelectedEggs: (eggs: Set<string>) => void;
}) {
  const [openModal, setOpenModal] = useState<'install' | null>(null);

  return (
    <>
      <EggRepositoryEggsInstallModal
        eggRepository={eggRepository}
        selectedEggs={selectedEggs}
        setSelectedEggs={setSelectedEggs}
        opened={openModal === 'install'}
        onClose={() => setOpenModal(null)}
      />

      <ActionBar opened={selectedEggs.size > 0}>
        <Button onClick={() => setOpenModal('install')} className='col-span-full'>
          <FontAwesomeIcon icon={faDownload} className='mr-2' /> Install
        </Button>
      </ActionBar>
    </>
  );
}

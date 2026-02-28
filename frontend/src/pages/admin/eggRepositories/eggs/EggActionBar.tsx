import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import ActionBar from '@/elements/ActionBar.tsx';
import Button from '@/elements/Button.tsx';
import { ObjectSet } from '@/lib/objectSet.ts';
import EggRepositoryEggsInstallModal from './modals/EggRepositoryEggsInstallModal.tsx';

export default function EggActionBar({
  eggRepository,
  selectedEggs,
  setSelectedEggs,
}: {
  eggRepository: AdminEggRepository;
  selectedEggs: ObjectSet<AdminEggRepositoryEgg, 'uuid'>;
  setSelectedEggs: (eggs: ObjectSet<AdminEggRepositoryEgg, 'uuid'>) => void;
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

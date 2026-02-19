import { ModalProps, Stack } from '@mantine/core';
import { useEffect, useState } from 'react';
import installEggs from '@/api/admin/egg-repositories/eggs/installEggs.ts';
import getNests from '@/api/admin/nests/getNests.ts';
import { httpErrorToHuman } from '@/api/axios.ts';
import Button from '@/elements/Button.tsx';
import Select from '@/elements/input/Select.tsx';
import { Modal, ModalFooter } from '@/elements/modals/Modal.tsx';
import { useSearchableResource } from '@/plugins/useSearchableResource.ts';
import { useToast } from '@/providers/ToastProvider.tsx';

export default function EggRepositoryEggsInstallModal({
  eggRepository,
  selectedEggs,
  setSelectedEggs,
  opened,
  onClose,
}: ModalProps & {
  eggRepository: AdminEggRepository;
  selectedEggs: Set<string>;
  setSelectedEggs: (eggs: Set<string>) => void;
}) {
  const { addToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [selectedNest, setSelectedNest] = useState<AdminNest | null>(null);

  const nests = useSearchableResource<AdminNest>({
    canRequest: opened,
    fetcher: (search) => getNests(1, search),
    deps: [opened],
  });

  useEffect(() => {
    if (!opened) {
      nests.setSearch('');
      setSelectedNest(null);
    }
  }, [opened]);

  const doInstall = () => {
    setLoading(true);

    installEggs(eggRepository.uuid, [...selectedEggs], selectedNest!.uuid)
      .then((installed) => {
        addToast(`${installed} Egg${installed !== 1 ? 's' : ''} installed.`, 'success');
        setSelectedEggs(new Set());

        onClose();
      })
      .catch((msg) => {
        addToast(httpErrorToHuman(msg), 'error');
      })
      .finally(() => setLoading(false));
  };

  return (
    <Modal title='Install Egg Repository Eggs' onClose={onClose} opened={opened}>
      <Stack>
        <Select
          withAsterisk
          label='Nest'
          placeholder='Nest'
          value={selectedNest?.uuid}
          onChange={(value) => setSelectedNest(nests.items.find((m) => m.uuid === value) ?? null)}
          data={nests.items.map((mount) => ({
            label: mount.name,
            value: mount.uuid,
          }))}
          searchable
          searchValue={nests.search}
          onSearchChange={nests.setSearch}
        />

        <ModalFooter>
          <Button onClick={doInstall} loading={loading} disabled={!selectedNest}>
            Install {selectedEggs.size} Egg{selectedEggs.size !== 1 && 's'}
          </Button>
          <Button variant='default' onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </Stack>
    </Modal>
  );
}

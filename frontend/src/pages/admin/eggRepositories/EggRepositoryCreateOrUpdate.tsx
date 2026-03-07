import { Group, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import createEggRepository from '@/api/admin/egg-repositories/createEggRepository.ts';
import deleteEggRepository from '@/api/admin/egg-repositories/deleteEggRepository.ts';
import syncEggRepository from '@/api/admin/egg-repositories/syncEggRepository.ts';
import updateEggRepository from '@/api/admin/egg-repositories/updateEggRepository.ts';
import { httpErrorToHuman } from '@/api/axios.ts';
import Button from '@/elements/Button.tsx';
import { AdminCan } from '@/elements/Can.tsx';
import Code from '@/elements/Code.tsx';
import AdminContentContainer from '@/elements/containers/AdminContentContainer.tsx';
import TextArea from '@/elements/input/TextArea.tsx';
import TextInput from '@/elements/input/TextInput.tsx';
import ConfirmationModal from '@/elements/modals/ConfirmationModal.tsx';
import { adminEggRepositorySchema } from '@/lib/schemas/admin/eggRepositories.ts';
import { useResourceForm } from '@/plugins/useResourceForm.ts';
import { useToast } from '@/providers/ToastProvider.tsx';

export default function EggRepositoryCreateOrUpdate({
  contextEggRepository,
}: {
  contextEggRepository?: AdminEggRepository;
}) {
  const { addToast } = useToast();

  const [openModal, setOpenModal] = useState<'delete' | null>(null);

  const form = useForm<z.infer<typeof adminEggRepositorySchema>>({
    mode: 'uncontrolled',
    initialValues: {
      name: '',
      description: null,
      gitRepository: '',
    },
    validateInputOnBlur: true,
    validate: zod4Resolver(adminEggRepositorySchema),
  });

  const { loading, setLoading, doCreateOrUpdate, doDelete } = useResourceForm<
    AdminUpdateEggRepository,
    AdminEggRepository
  >({
    form,
    createFn: () => createEggRepository(adminEggRepositorySchema.parse(form.getValues())),
    updateFn: contextEggRepository
      ? () => updateEggRepository(contextEggRepository.uuid, adminEggRepositorySchema.parse(form.getValues()))
      : undefined,
    deleteFn: contextEggRepository ? () => deleteEggRepository(contextEggRepository.uuid) : undefined,
    doUpdate: !!contextEggRepository,
    basePath: '/admin/egg-repositories',
    resourceName: 'Egg Repository',
  });

  useEffect(() => {
    if (contextEggRepository) {
      form.setValues({
        name: contextEggRepository.name,
        description: contextEggRepository.description,
        gitRepository: contextEggRepository.gitRepository,
      });
    }
  }, [contextEggRepository]);

  const doSync = () => {
    setLoading(true);
    syncEggRepository(contextEggRepository!.uuid)
      .then((found) => {
        addToast(`Egg Repository synchronised, found ${found} Egg${found === 1 ? '' : 's'}.`, 'success');
      })
      .catch((msg) => {
        addToast(httpErrorToHuman(msg), 'error');
      })
      .finally(() => setLoading(false));
  };

  return (
    <AdminContentContainer
      title={`${contextEggRepository ? 'Update' : 'Create'} Egg Repository`}
      fullscreen={!!contextEggRepository}
    >
      <ConfirmationModal
        opened={openModal === 'delete'}
        onClose={() => setOpenModal(null)}
        title='Confirm Nest Deletion'
        confirm='Delete'
        onConfirmed={doDelete}
      >
        Are you sure you want to delete <Code>{form.getValues().name}</Code>?
      </ConfirmationModal>

      <form onSubmit={form.onSubmit(() => doCreateOrUpdate(false))}>
        <Stack mt='xs'>
          <Group grow>
            <TextInput
              withAsterisk
              label='Name'
              placeholder='Name'
              key={form.key('name')}
              {...form.getInputProps('name')}
            />
            <TextInput
              withAsterisk
              label='Git Repository'
              placeholder='Git Repository'
              key={form.key('gitRepository')}
              {...form.getInputProps('gitRepository')}
            />
          </Group>

          <TextArea
            label='Description'
            placeholder='Description'
            rows={3}
            key={form.key('description')}
            {...form.getInputProps('description')}
          />
        </Stack>

        <Group mt='md'>
          <AdminCan action={contextEggRepository ? 'egg-repositories.update' : 'egg-repositories.create'} cantSave>
            <Button type='submit' disabled={!form.isValid()} loading={loading}>
              Save
            </Button>
            {!contextEggRepository && (
              <Button onClick={() => doCreateOrUpdate(true)} disabled={!form.isValid()} loading={loading}>
                Save & Stay
              </Button>
            )}
          </AdminCan>
          {contextEggRepository && (
            <AdminCan action='egg-repositories.sync'>
              <Button variant='outline' onClick={doSync} loading={loading}>
                Sync
              </Button>
            </AdminCan>
          )}
          {contextEggRepository && (
            <AdminCan action='egg-repositories.delete' cantDelete>
              <Button color='red' onClick={() => setOpenModal('delete')} loading={loading}>
                Delete
              </Button>
            </AdminCan>
          )}
        </Group>
      </form>
    </AdminContentContainer>
  );
}

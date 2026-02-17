import { ModalProps, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { useState } from 'react';
import { z } from 'zod';
import { httpErrorToHuman } from '@/api/axios.ts';
import copyFilesRemote from '@/api/server/files/copyFilesRemote.ts';
import getServers from '@/api/server/getServers.ts';
import Button from '@/elements/Button.tsx';
import Code from '@/elements/Code.tsx';
import Select from '@/elements/input/Select.tsx';
import TextInput from '@/elements/input/TextInput.tsx';
import Modal from '@/elements/modals/Modal.tsx';
import { serverFilesCopyRemoteSchema } from '@/lib/schemas/server/files.ts';
import { useSearchableResource } from '@/plugins/useSearchableResource.ts';
import { useToast } from '@/providers/ToastProvider.tsx';
import { useServerStore } from '@/stores/server.ts';

type Props = ModalProps & {
  files: DirectoryEntry[];
};

export default function FileCopyModal({ files, opened, onClose }: Props) {
  const { addToast } = useToast();
  const { server, browsingDirectory, setSelectedFiles } = useServerStore();

  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof serverFilesCopyRemoteSchema>>({
    initialValues: {
      destination: '',
      destinationServer: '',
    },
    validateInputOnBlur: true,
    validate: zod4Resolver(serverFilesCopyRemoteSchema),
  });

  const servers = useSearchableResource<Server>({
    fetcher: (search) => getServers(1, search),
  });

  const doCopy = () => {
    setLoading(true);

    copyFilesRemote(server.uuid, {
      ...form.values,
      root: browsingDirectory!,
      files: files.map((f) => f.name),
    })
      .then(() => {
        setSelectedFiles([]);
        addToast('File copying has started.', 'success');
        onClose();
      })
      .catch((msg) => {
        addToast(httpErrorToHuman(msg), 'error');
      })
      .finally(() => setLoading(false));
  };

  return (
    <Modal title='Remote Copy Files' onClose={onClose} opened={opened}>
      <form onSubmit={form.onSubmit(() => doCopy())}>
        <Stack>
          <Select
            withAsterisk
            label='Server'
            placeholder='Server'
            data={servers.items.reduce(
              (acc, server) => {
                const group = acc.find((g) => g.group === server.nodeName);
                const serverItem = { label: server.name, value: server.uuid };

                if (group) {
                  group.items.push(serverItem);
                } else {
                  acc.push({ group: server.nodeName, items: [serverItem] });
                }

                return acc;
              },
              [] as Array<{ group: string; items: Array<{ label: string; value: string }> }>,
            )}
            searchable
            searchValue={servers.search}
            onSearchChange={servers.setSearch}
            allowDeselect
            {...form.getInputProps('destinationServer')}
            onChange={(value) => form.setFieldValue('destinationServer', value || '')}
          />

          <TextInput label='Destination' placeholder='Destination' {...form.getInputProps('destination')} />
        </Stack>

        <p className='mt-2 text-sm md:text-base break-all'>
          <span className='text-neutral-200'>These files will be created on the remote server under&nbsp;</span>
          <Code>
            /home/container/
            <span className='text-cyan-200'>{form.values.destination.replace(/^(\.\.\/|\/)+/, '')}</span>
          </Code>
        </p>

        <Modal.Footer>
          <Button type='submit' loading={loading}>
            Copy
          </Button>
          <Button variant='default' onClick={onClose}>
            Close
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}

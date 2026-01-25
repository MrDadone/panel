import { ModalProps } from '@mantine/core';
import { useForm } from '@mantine/form';
import classNames from 'classnames';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { join } from 'pathe';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { httpErrorToHuman } from '@/api/axios.ts';
import pullFile from '@/api/server/files/pullFile.ts';
import queryFilePull from '@/api/server/files/queryFilePull.ts';
import Button from '@/elements/Button.tsx';
import Code from '@/elements/Code.tsx';
import TextInput from '@/elements/input/TextInput.tsx';
import Modal from '@/elements/modals/Modal.tsx';
import { serverFilesPullSchema } from '@/lib/schemas/server/files.ts';
import { bytesToString } from '@/lib/size.ts';
import { useToast } from '@/providers/ToastProvider.tsx';
import { useServerStore } from '@/stores/server.ts';

export default function PullFileModal({ opened, onClose }: ModalProps) {
  const { addToast } = useToast();
  const { server, browsingDirectory } = useServerStore();

  const [loading, setLoading] = useState(false);
  const [queryResult, setQueryResult] = useState<null | ServerPullQueryResult>(null);

  const form = useForm<z.infer<typeof serverFilesPullSchema>>({
    initialValues: {
      url: '',
      name: '',
    },
    validateInputOnBlur: true,
    validate: zod4Resolver(serverFilesPullSchema),
  });

  useEffect(() => {
    setQueryResult(null);
  }, [form.values.url]);

  const doQueryFilePull = () => {
    setLoading(true);

    queryFilePull(server.uuid, form.values.url)
      .then((data) => {
        addToast('File information retrieved successfully.', 'success');
        setQueryResult(data);
        form.setFieldValue('name', data.fileName ?? form.values.url.split('/').pop() ?? '');
      })
      .catch((msg) => {
        addToast(httpErrorToHuman(msg), 'error');
      })
      .finally(() => setLoading(false));
  };

  const doPullFile = () => {
    setLoading(true);

    pullFile(server.uuid, {
      root: browsingDirectory!,
      url: form.values.url,
      name: form.values.name,
    })
      .then(() => {
        addToast('File pulling has started.', 'success');
        onClose();
      })
      .catch((msg) => {
        addToast(httpErrorToHuman(msg), 'error');
      })
      .finally(() => setLoading(false));
  };

  return (
    <Modal title='Pull File' onClose={onClose} opened={opened}>
      <form onSubmit={form.onSubmit(() => doPullFile())}>
        <div className='grid grid-cols-4 gap-2'>
          <TextInput
            withAsterisk
            className='col-span-3'
            label='File URL'
            placeholder='File URL'
            {...form.getInputProps('url')}
          />
          <Button
            className={classNames('self-end', !!form.errors.url && 'mb-5')}
            onClick={doQueryFilePull}
            loading={loading}
            disabled={!form.isValid('url')}
          >
            Query
          </Button>
        </div>

        <TextInput
          withAsterisk
          label='File Name'
          placeholder={queryResult?.fileName ?? 'File Name'}
          className='mt-2'
          {...form.getInputProps('name')}
        />

        <p className='mt-2 text-sm md:text-base break-all'>
          <span className='text-neutral-200'>This file will be created as&nbsp;</span>
          <Code>
            /home/container/
            <span className='text-cyan-200'>
              {join(browsingDirectory!, form.values.name ?? '').replace(/^(\.\.\/|\/)+/, '')}
            </span>
          </Code>
        </p>

        <Modal.Footer>
          <Button type='submit' loading={loading} disabled={!form.isValid()}>
            Pull{queryResult?.fileSize ? ` (${bytesToString(queryResult.fileSize)})` : ''}
          </Button>
          <Button variant='default' onClick={onClose}>
            Close
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}

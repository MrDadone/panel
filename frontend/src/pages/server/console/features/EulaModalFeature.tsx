import { Anchor, Group, Text } from '@mantine/core';
import { useState } from 'react';
import { httpErrorToHuman } from '@/api/axios.ts';
import getFileContent from '@/api/server/files/getFileContent.ts';
import saveFileContent from '@/api/server/files/saveFileContent.ts';
import Button from '@/elements/Button.tsx';
import Modal from '@/elements/modals/Modal.tsx';
import useWebsocketEvent, { SocketEvent } from '@/plugins/useWebsocketEvent.ts';
import { useToast } from '@/providers/ToastProvider.tsx';
import { useServerStore } from '@/stores/server.ts';

export default function EulaModal() {
  const { addToast } = useToast();
  const { server, state, socketInstance } = useServerStore();

  const [opened, setOpened] = useState(false);
  const [loading, setLoading] = useState(false);

  useWebsocketEvent(SocketEvent.CONSOLE_OUTPUT, (line) => {
    if (line.includes('You need to agree to the EULA') && state !== 'running') {
      setOpened(true);
    }
  });

  const acceptEula = async () => {
    setLoading(true);

    try {
      let content: string;
      try {
        content = await getFileContent(server.uuid, '/eula.txt');
      } catch {
        content = 'eula=false';
      }

      const updatedContent = content.replace(/eula\s*=\s*false/gi, 'eula=true');
      await saveFileContent(server.uuid, '/eula.txt', updatedContent);

      addToast('EULA accepted successfully.', 'success');
      setOpened(false);

      socketInstance?.send('set state', 'restart');
    } catch (error) {
      addToast(httpErrorToHuman(error as object), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title='Minecraft EULA Agreement' opened={opened} onClose={() => setOpened(false)}>
      <Text size='sm' mb='md'>
        The Minecraft server requires you to accept the{' '}
        <Anchor href='https://minecraft.net/eula' target='_blank' rel='noopener noreferrer'>
          Minecraft End User License Agreement
        </Anchor>{' '}
        before it can start.
      </Text>
      <Text size='sm' mb='md'>
        By clicking &quot;Accept EULA&quot;, you agree to the terms of the Minecraft EULA and the{' '}
        <strong>eula.txt</strong> file will be updated to <strong>eula=true</strong>.
      </Text>
      <Group mt='md'>
        <Button color='green' loading={loading} onClick={acceptEula}>
          Accept EULA
        </Button>
        <Button variant='default' onClick={() => setOpened(false)}>
          Cancel
        </Button>
      </Group>
    </Modal>
  );
}

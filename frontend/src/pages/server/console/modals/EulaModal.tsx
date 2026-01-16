import { Anchor, Group, ModalProps, Text } from '@mantine/core';
import { useState } from 'react';
import { httpErrorToHuman } from '@/api/axios.ts';
import getFileContent from '@/api/server/files/getFileContent.ts';
import saveFileContent from '@/api/server/files/saveFileContent.ts';
import Button from '@/elements/Button.tsx';
import Modal from '@/elements/modals/Modal.tsx';
import { useToast } from '@/providers/ToastProvider.tsx';
import { useServerStore } from '@/stores/server.ts';

interface EulaModalProps extends ModalProps {
  onAccepted?: () => void;
}

export default function EulaModal({ opened, onClose, onAccepted }: EulaModalProps) {
  const { addToast } = useToast();
  const { server, socketInstance } = useServerStore();
  const [loading, setLoading] = useState(false);

  const acceptEula = async () => {
    setLoading(true);

    try {
      // Read the current eula.txt content
      let content: string;
      try {
        content = await getFileContent(server.uuid, '/eula.txt');
      } catch {
        // If file doesn't exist or can't be read, create default content
        content = 'eula=false';
      }

      // Replace eula=false with eula=true
      const updatedContent = content.replace(/eula\s*=\s*false/gi, 'eula=true');

      // Save the modified content
      await saveFileContent(server.uuid, '/eula.txt', updatedContent);

      addToast('EULA accepted successfully. Starting server...', 'success');
      onClose();
      onAccepted?.();

      // Restart the server
      socketInstance?.send('set state', 'restart');
    } catch (error) {
      addToast(httpErrorToHuman(error), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title='Minecraft EULA Agreement' opened={opened} onClose={onClose}>
      <Text size='sm' mb='md'>
        The Minecraft server requires you to accept the{' '}
        <Anchor href='https://aka.ms/MinecraftEULA' target='_blank' rel='noopener noreferrer'>
          Minecraft End User License Agreement
        </Anchor>{' '}
        before it can start.
      </Text>
      <Text size='sm' mb='md'>
        By clicking &quot;Accept EULA&quot;, you agree to the terms of the Minecraft EULA and the{' '}
        <code>eula.txt</code> file will be updated to <code>eula=true</code>.
      </Text>
      <Group mt='md'>
        <Button color='green' loading={loading} onClick={acceptEula}>
          Accept EULA
        </Button>
        <Button variant='default' onClick={onClose}>
          Cancel
        </Button>
      </Group>
    </Modal>
  );
}

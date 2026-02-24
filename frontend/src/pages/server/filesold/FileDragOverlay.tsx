import { faFile, faFolder } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Badge, Group, Paper, Text } from '@mantine/core';

interface FileDragOverlayProps {
  file: DirectoryEntry;
  count: number;
}

export default function FileDragOverlay({ file, count }: FileDragOverlayProps) {
  return (
    <Paper
      shadow='lg'
      p='sm'
      radius='md'
      style={{
        background: 'var(--mantine-color-dark-6)',
        border: '1px solid var(--mantine-color-dark-4)',
        cursor: 'grabbing',
        minWidth: 200,
      }}
    >
      <Group gap='sm'>
        <FontAwesomeIcon icon={file.directory ? faFolder : faFile} className='text-gray-400' />
        <Text size='sm' c='white' truncate style={{ maxWidth: 150 }}>
          {file.name}
        </Text>
        {count > 1 && (
          <Badge size='sm' variant='filled' color='blue'>
            +{count - 1}
          </Badge>
        )}
      </Group>
    </Paper>
  );
}

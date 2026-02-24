import { Box, Group, Title } from '@mantine/core';
import Card from './Card.tsx';

export default function TitleCard({
  title,
  icon,
  children,
  className,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card withBorder radius='md' p={0} bg='dark.7' className={className}>
      <Box
        px='md'
        py='sm'
        style={{
          borderBottom: '1px solid var(--mantine-color-dark-5)',
          background: 'var(--mantine-color-dark-6)',
        }}
      >
        <Group gap='sm'>
          <Box
            style={{
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 6,
              background: 'var(--mantine-color-dark-5)',
            }}
          >
            {icon}
          </Box>
          <Title order={5} c='gray.2' fw={600}>
            {title}
          </Title>
        </Group>
      </Box>
      <div className='p-4'>{children}</div>
    </Card>
  );
}

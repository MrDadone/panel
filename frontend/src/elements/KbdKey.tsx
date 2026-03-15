import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box } from '@mantine/core';

interface KbdKeyProps {
  children: React.ReactNode;
  icon?: IconDefinition;
}

export default function KbdKey({ children, icon }: KbdKeyProps) {
  return (
    <Box
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 42,
        height: 30,
        background: 'linear-gradient(180deg, var(--mantine-color-dark-5) 0%, var(--mantine-color-dark-6) 100%)',
        border: '1px solid var(--mantine-color-dark-4)',
        borderRadius: 6,
        boxShadow: '0 2px 0 var(--mantine-color-dark-7), inset 0 1px 0 rgba(255,255,255,0.05)',
        fontSize: 11,
        fontWeight: 600,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: 'var(--mantine-color-gray-3)',
        textTransform: 'uppercase',
        letterSpacing: '0.02em',
      }}
    >
      {icon ? <FontAwesomeIcon icon={icon} size='sm' /> : children}
    </Box>
  );
}

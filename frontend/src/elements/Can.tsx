import { Tooltip } from '@mantine/core';
import { memo, ReactNode } from 'react';
import isEqual from 'react-fast-compare';
import Button from '@/elements/Button.tsx';
import { useAdminPermissions, useCan, useServerPermissions } from '@/plugins/usePermissions.ts';

interface Props {
  action: string | string[];
  matchAny?: boolean;
  renderOnCant?: ReactNode | null;
  cantSave?: boolean;
  cantDelete?: boolean;
  children: ReactNode;
}

const CantSaveTooltip = () => (
  <Tooltip label='You do not have permission to save.'>
    <Button disabled>Save</Button>
  </Tooltip>
);

const CantDeleteTooltip = () => (
  <Tooltip label='You do not have permission to delete.'>
    <Button color='red' disabled>
      Delete
    </Button>
  </Tooltip>
);

const AdminCan = memo(({ action, matchAny = false, renderOnCant, cantSave, cantDelete, children }: Props) => {
  const canMatrix = useAdminPermissions(action);
  const can = useCan(canMatrix, matchAny);

  return can ? children : cantSave ? <CantSaveTooltip /> : cantDelete ? <CantDeleteTooltip /> : renderOnCant;
}, isEqual);

const ServerCan = memo(({ action, matchAny = false, renderOnCant, children }: Props) => {
  const canMatrix = useServerPermissions(action);
  const can = useCan(canMatrix, matchAny);

  return can ? children : renderOnCant;
}, isEqual);

export { AdminCan, ServerCan };

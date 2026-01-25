import { forwardRef, memo } from 'react';
import { NavLink } from 'react-router';
import Code from '@/elements/Code.tsx';
import Checkbox from '@/elements/input/Checkbox.tsx';
import { TableData, TableRow } from '@/elements/Table.tsx';
import FormattedTimestamp from '@/elements/time/FormattedTimestamp.tsx';

interface ServerRowProps {
  server: AdminServer;
  showSelection?: boolean;
  isSelected?: boolean;
  onSelectionChange?: (selected: boolean) => void;
  onClick?: (event: React.MouseEvent) => void;
}

const ServerRow = memo(
  forwardRef<HTMLTableRowElement, ServerRowProps>(function ServerRow(
    { server, showSelection = false, isSelected = false, onSelectionChange, onClick },
    ref,
  ) {
    return (
      <TableRow bg={isSelected ? 'var(--mantine-color-blue-light)' : undefined} onClick={onClick} ref={ref}>
        <TableData className='pl-4 relative cursor-pointer w-10 text-center'>
          {showSelection ? (
            <Checkbox
              id={server.uuid}
              checked={isSelected}
              onChange={(e) => {
                onSelectionChange?.(e.target.checked);
              }}
              onClick={(e) => e.stopPropagation()}
              classNames={{ input: 'cursor-pointer!' }}
            />
          ) : (
            <span className='w-0'></span>
          )}
        </TableData>
        <TableData>
          <NavLink to={`/admin/servers/${server.uuid}`} className='text-blue-400 hover:text-blue-200 hover:underline'>
            <Code>{server.uuid}</Code>
          </NavLink>
        </TableData>

        <TableData>{server.name}</TableData>

        <TableData>
          <NavLink
            to={`/admin/nodes/${server.node.uuid}`}
            className='text-blue-400 hover:text-blue-200 hover:underline'
          >
            <Code>{server.node.name}</Code>
          </NavLink>
        </TableData>

        <TableData>
          <NavLink
            to={`/admin/users/${server.owner.uuid}`}
            className='text-blue-400 hover:text-blue-200 hover:underline'
          >
            <Code>{server.owner.username}</Code>
          </NavLink>
        </TableData>

        <TableData>
          <Code>{server.allocation ? `${server.allocation.ip}:${server.allocation.port}` : '-'}</Code>
        </TableData>

        <TableData>
          <FormattedTimestamp timestamp={server.created} />
        </TableData>
      </TableRow>
    );
  }),
);

export default ServerRow;

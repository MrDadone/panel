import { forwardRef, memo } from 'react';
import { NavLink } from 'react-router';
import Code from '@/elements/Code.tsx';
import Checkbox from '@/elements/input/Checkbox.tsx';
import { TableData, TableRow } from '@/elements/Table.tsx';
import FormattedTimestamp from '@/elements/time/FormattedTimestamp.tsx';
import { useAdminStore } from '@/stores/admin.tsx';

interface NodeAllocationRowProps {
  allocation: NodeAllocation;
}

const NodeAllocationRow = memo(
  forwardRef<HTMLTableRowElement, NodeAllocationRowProps>(function FileRow({ allocation }, ref) {
    const { selectedNodeAllocations, addSelectedNodeAllocation, removeSelectedNodeAllocation } = useAdminStore();

    const isNodeAllocationSelected = selectedNodeAllocations.some((a) => a.uuid === allocation.uuid);

    return (
      <TableRow
        bg={isNodeAllocationSelected ? 'var(--mantine-color-blue-light)' : undefined}
        onClick={(e) => {
          if (e.ctrlKey || e.metaKey) {
            addSelectedNodeAllocation(allocation);
            return true;
          }

          return false;
        }}
        ref={ref}
      >
        <td className='pl-4 relative cursor-pointer w-10 text-center'>
          <Checkbox
            id={allocation.uuid}
            checked={isNodeAllocationSelected}
            onChange={() => {
              if (isNodeAllocationSelected) {
                removeSelectedNodeAllocation(allocation);
              } else {
                addSelectedNodeAllocation(allocation);
              }
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </td>

        <TableData>
          <Code>{allocation.uuid}</Code>
        </TableData>

        <TableData>
          <Code>
            {allocation.server ? (
              <NavLink
                to={`/admin/servers/${allocation.server.uuid}`}
                className='text-blue-400 hover:text-blue-200 hover:underline'
              >
                {allocation.server.name}
              </NavLink>
            ) : (
              '-'
            )}
          </Code>
        </TableData>

        <TableData>
          <Code>{allocation.ip}</Code>
        </TableData>

        <TableData>
          <Code>{allocation.ipAlias ?? 'N/A'}</Code>
        </TableData>

        <TableData>
          <Code>{allocation.port}</Code>
        </TableData>

        <TableData>
          <FormattedTimestamp timestamp={allocation.created} />
        </TableData>
      </TableRow>
    );
  }),
);

export default NodeAllocationRow;

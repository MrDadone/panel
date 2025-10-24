import Code from '@/elements/Code';
import { TableData, TableRow } from '@/elements/Table';
import Tooltip from '@/elements/Tooltip';
import { formatDateTime, formatTimestamp } from '@/lib/time';
import { NavLink } from 'react-router';

export const nestTableColumns = ['ID', 'Name', 'Author', 'Description', 'Created'];

export default ({ nest }: { nest: Nest }) => {
  return (
    <TableRow>
      <TableData>
        <NavLink to={`/admin/nests/${nest.uuid}`} className={'text-blue-400 hover:text-blue-200 hover:underline'}>
          <Code>{nest.uuid}</Code>
        </NavLink>
      </TableData>

      <TableData>{nest.name}</TableData>

      <TableData>{nest.author}</TableData>

      <TableData>{nest.description}</TableData>

      <TableData>
        <Tooltip label={formatDateTime(nest.created)}>{formatTimestamp(nest.created)}</Tooltip>
      </TableData>
    </TableRow>
  );
};

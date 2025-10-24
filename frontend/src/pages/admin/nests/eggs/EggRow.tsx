import Code from '@/elements/Code';
import { TableData, TableRow } from '@/elements/Table';
import Tooltip from '@/elements/Tooltip';
import { formatDateTime, formatTimestamp } from '@/lib/time';
import { NavLink } from 'react-router';

export const eggTableColumns = ['ID', 'Name', 'Author', 'Description', 'Created'];

export default ({ nest, egg }: { nest: Nest; egg: AdminNestEgg }) => {
  return (
    <TableRow>
      <TableData>
        <NavLink
          to={`/admin/nests/${nest.uuid}/eggs/${egg.uuid}`}
          className={'text-blue-400 hover:text-blue-200 hover:underline'}
        >
          <Code>{egg.uuid}</Code>
        </NavLink>
      </TableData>

      <TableData>{egg.name}</TableData>

      <TableData>{egg.author}</TableData>

      <TableData>{egg.description}</TableData>

      <TableData>
        <Tooltip label={formatDateTime(egg.created)}>{formatTimestamp(egg.created)}</Tooltip>
      </TableData>
    </TableRow>
  );
};

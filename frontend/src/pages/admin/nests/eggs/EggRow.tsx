import { NavLink } from 'react-router';
import Code from '@/elements/Code.tsx';
import { TableData, TableRow } from '@/elements/Table.tsx';
import FormattedTimestamp from '@/elements/time/FormattedTimestamp.tsx';

export default function EggRow({ nest, egg }: { nest: AdminNest; egg: AdminNestEgg }) {
  return (
    <TableRow>
      <TableData>
        <NavLink
          to={`/admin/nests/${nest.uuid}/eggs/${egg.uuid}`}
          className='text-blue-400 hover:text-blue-200 hover:underline'
        >
          <Code>{egg.uuid}</Code>
        </NavLink>
      </TableData>

      <TableData>{egg.name}</TableData>

      <TableData>{egg.author}</TableData>

      <TableData>{egg.description}</TableData>

      <TableData>
        <FormattedTimestamp timestamp={egg.created} />
      </TableData>
    </TableRow>
  );
}

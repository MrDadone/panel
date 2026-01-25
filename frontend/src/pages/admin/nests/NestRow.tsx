import { NavLink } from 'react-router';
import Code from '@/elements/Code.tsx';
import { TableData, TableRow } from '@/elements/Table.tsx';
import FormattedTimestamp from '@/elements/time/FormattedTimestamp.tsx';

export default function NestRow({ nest }: { nest: AdminNest }) {
  return (
    <TableRow>
      <TableData>
        <NavLink to={`/admin/nests/${nest.uuid}`} className='text-blue-400 hover:text-blue-200 hover:underline'>
          <Code>{nest.uuid}</Code>
        </NavLink>
      </TableData>

      <TableData>{nest.name}</TableData>

      <TableData>{nest.author}</TableData>

      <TableData>{nest.description}</TableData>

      <TableData>
        <FormattedTimestamp timestamp={nest.created} />
      </TableData>
    </TableRow>
  );
}

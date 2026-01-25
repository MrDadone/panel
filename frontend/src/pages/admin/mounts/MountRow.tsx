import { NavLink } from 'react-router';
import Code from '@/elements/Code.tsx';
import { TableData, TableRow } from '@/elements/Table.tsx';
import FormattedTimestamp from '@/elements/time/FormattedTimestamp.tsx';

export default function MountRow({ mount }: { mount: Mount }) {
  return (
    <TableRow>
      <TableData>
        <NavLink to={`/admin/mounts/${mount.uuid}`} className='text-blue-400 hover:text-blue-200 hover:underline'>
          <Code>{mount.uuid}</Code>
        </NavLink>
      </TableData>

      <TableData>{mount.name}</TableData>
      <TableData>
        <Code>{mount.source}</Code>
      </TableData>
      <TableData>
        <Code>{mount.target}</Code>
      </TableData>
      <TableData>
        <FormattedTimestamp timestamp={mount.created} />
      </TableData>
    </TableRow>
  );
}

import { NavLink } from 'react-router';
import { z } from 'zod';
import Code from '@/elements/Code.tsx';
import { TableData, TableRow } from '@/elements/Table.tsx';
import FormattedTimestamp from '@/elements/time/FormattedTimestamp.tsx';
import { roleSchema } from '@/lib/schemas/user.ts';

export default function RoleRow({ role }: { role: z.infer<typeof roleSchema> }) {
  return (
    <TableRow>
      <TableData>
        <NavLink to={`/admin/roles/${role.uuid}`} className='text-blue-400 hover:text-blue-200 hover:underline'>
          <Code>{role.uuid}</Code>
        </NavLink>
      </TableData>

      <TableData>{role.name}</TableData>

      <TableData>{role.serverPermissions.length}</TableData>

      <TableData>{role.adminPermissions.length}</TableData>

      <TableData>
        <FormattedTimestamp timestamp={role.created} />
      </TableData>
    </TableRow>
  );
}

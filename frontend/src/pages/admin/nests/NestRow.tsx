import { NavLink } from 'react-router';
import { z } from 'zod';
import Code from '@/elements/Code.tsx';
import { TableData, TableRow } from '@/elements/Table.tsx';
import FormattedTimestamp from '@/elements/time/FormattedTimestamp.tsx';
import { adminNestSchema } from '@/lib/schemas/admin/nests.ts';

export default function NestRow({ nest }: { nest: z.infer<typeof adminNestSchema> }) {
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

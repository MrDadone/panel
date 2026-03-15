import { NavLink } from 'react-router';
import { z } from 'zod';
import Code from '@/elements/Code.tsx';
import { TableData, TableRow } from '@/elements/Table.tsx';
import FormattedTimestamp from '@/elements/time/FormattedTimestamp.tsx';
import { adminLocationSchema } from '@/lib/schemas/admin/locations.ts';

export default ({ location }: { location: z.infer<typeof adminLocationSchema> }) => {
  return (
    <TableRow>
      <TableData>
        <NavLink to={`/admin/locations/${location.uuid}`} className='text-blue-400 hover:text-blue-200 hover:underline'>
          <Code>{location.uuid}</Code>
        </NavLink>
      </TableData>

      <TableData>{location.name}</TableData>

      <TableData>
        <Code>
          {location.backupConfiguration ? (
            <NavLink
              to={`/admin/backup-configurations/${location.backupConfiguration.uuid}`}
              className='text-blue-400 hover:text-blue-200 hover:underline'
            >
              {location.backupConfiguration.name}
            </NavLink>
          ) : (
            '-'
          )}
        </Code>
      </TableData>

      <TableData>
        <FormattedTimestamp timestamp={location.created} />
      </TableData>
    </TableRow>
  );
};

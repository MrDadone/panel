import { NavLink } from 'react-router';
import Code from '@/elements/Code.tsx';
import { TableData, TableRow } from '@/elements/Table.tsx';
import FormattedTimestamp from '@/elements/time/FormattedTimestamp.tsx';
import { backupDiskLabelMapping } from '@/lib/enums.ts';

export default function BackupConfigurationRow({ backupConfiguration }: { backupConfiguration: BackupConfiguration }) {
  return (
    <TableRow>
      <TableData>
        <NavLink
          to={`/admin/backup-configurations/${backupConfiguration.uuid}`}
          className='text-blue-400 hover:text-blue-200 hover:underline'
        >
          <Code>{backupConfiguration.uuid}</Code>
        </NavLink>
      </TableData>

      <TableData>{backupConfiguration.name}</TableData>
      <TableData>{backupDiskLabelMapping[backupConfiguration.backupDisk]}</TableData>

      <TableData>
        <FormattedTimestamp timestamp={backupConfiguration.created} />
      </TableData>
    </TableRow>
  );
}

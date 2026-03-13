import { forwardRef, memo, useRef } from 'react';
import { NavLink } from 'react-router';
import Code from '@/elements/Code.tsx';
import Progress from '@/elements/Progress.tsx';
import { TableData, TableRow } from '@/elements/Table.tsx';
import Tooltip from '@/elements/Tooltip.tsx';
import FormattedTimestamp from '@/elements/time/FormattedTimestamp.tsx';
import { bytesToString } from '@/lib/size.ts';

interface ServerRowProps {
  server: AdminServer;
  transferProgress?: TransferProgress;
}

const ServerRow = memo(
  forwardRef<HTMLTableRowElement, ServerRowProps>(function ServerRow({ server, transferProgress }, ref) {
    const lastProgress = useRef(transferProgress);

    const archiveRate =
      lastProgress.current && transferProgress
        ? transferProgress.archiveProgress - lastProgress.current.archiveProgress
        : 0;
    const networkRate =
      lastProgress.current && transferProgress
        ? transferProgress.networkProgress - lastProgress.current.networkProgress
        : 0;

    if (transferProgress) {
      lastProgress.current = transferProgress;
    }

    return (
      <TableRow ref={ref}>
        <TableData>
          <NavLink to={`/admin/servers/${server.uuid}`} className='text-blue-400 hover:text-blue-200 hover:underline'>
            <Code>{server.uuid}</Code>
          </NavLink>
        </TableData>

        <TableData>
          <Tooltip
            label={`${bytesToString(transferProgress?.archiveProgress || 0)} / ${bytesToString(transferProgress?.total || 0)}`}
            innerClassName='w-full'
          >
            <Progress value={((transferProgress?.archiveProgress || 0) / (transferProgress?.total || 1)) * 100} />
          </Tooltip>
        </TableData>

        <TableData>{bytesToString(archiveRate)}/s</TableData>

        <TableData>{bytesToString(networkRate)}/s</TableData>

        <TableData>{server.name}</TableData>

        <TableData>
          <NavLink
            to={`/admin/nodes/${server.node.uuid}`}
            className='text-blue-400 hover:text-blue-200 hover:underline'
          >
            <Code>{server.node.name}</Code>
          </NavLink>
        </TableData>

        <TableData>
          <NavLink
            to={`/admin/users/${server.owner.uuid}`}
            className='text-blue-400 hover:text-blue-200 hover:underline'
          >
            <Code>{server.owner.username}</Code>
          </NavLink>
        </TableData>

        <TableData>
          <FormattedTimestamp timestamp={server.created} />
        </TableData>
      </TableRow>
    );
  }),
);

export default ServerRow;

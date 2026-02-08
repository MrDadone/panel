import { faGlobe, faHeart, faHeartBroken } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import { NavLink } from 'react-router';
import { axiosInstance } from '@/api/axios.ts';
import Code from '@/elements/Code.tsx';
import Spinner from '@/elements/Spinner.tsx';
import { TableData, TableRow } from '@/elements/Table.tsx';
import Tooltip from '@/elements/Tooltip.tsx';
import FormattedTimestamp from '@/elements/time/FormattedTimestamp.tsx';

export default function NodeRow({ node }: { node: Node }) {
  const [version, setVersion] = useState<string | null>(null);

  useEffect(() => {
    axiosInstance
      .get(`${new URL(node.publicUrl ?? node.url).origin}/api/system`, {
        headers: {
          Authorization: `Bearer ${node.token}`,
        },
      })
      .then(({ data }) => {
        setVersion(data.version);
      })
      .catch((msg) => {
        console.error('Error while connecting to node', msg);
      });
  }, []);

  return (
    <TableRow>
      <TableData>
        {version ? (
          version === 'Unavailable' ? (
            <Tooltip label='Error while fetching version'>
              <FontAwesomeIcon icon={faHeartBroken} className='text-red-500' />
            </Tooltip>
          ) : (
            <Tooltip label={version}>
              <FontAwesomeIcon icon={faHeart} className='text-green-500 animate-pulse' />
            </Tooltip>
          )
        ) : (
          <Spinner size={16} />
        )}
      </TableData>

      <TableData>
        <NavLink to={`/admin/nodes/${node.uuid}`} className='text-blue-400 hover:text-blue-200 hover:underline'>
          <Code>{node.uuid}</Code>
        </NavLink>
      </TableData>

      <TableData>
        <span className='flex gap-2 items-center'>
          {node.name}&nbsp;
          {node.deploymentEnabled ? (
            <Tooltip label='Deployment Enabled'>
              <FontAwesomeIcon icon={faGlobe} className='text-green-500' />
            </Tooltip>
          ) : (
            <Tooltip label='Deployment Disabled'>
              <FontAwesomeIcon icon={faGlobe} className='text-red-500' />
            </Tooltip>
          )}
        </span>
      </TableData>

      <TableData>
        <NavLink
          to={`/admin/locations/${node.location.uuid}`}
          className='text-blue-400 hover:text-blue-200 hover:underline'
        >
          <Code>{node.location.name}</Code>
        </NavLink>
      </TableData>

      <TableData>
        <Code>{node.url}</Code>
      </TableData>

      <TableData>
        <FormattedTimestamp timestamp={node.created} />
      </TableData>
    </TableRow>
  );
}

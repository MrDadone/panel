import getServerActivity from '@/api/server/getServerActivity';
import ActivityInfoButton from '@/elements/activity/ActivityInfoButton';
import Code from '@/elements/Code';
import TextInput from '@/elements/input/TextInput';
import Spinner from '@/elements/Spinner';
import Table, { TableData, TableRow } from '@/elements/Table';
import Tooltip from '@/elements/Tooltip';
import { formatDateTime, formatTimestamp } from '@/lib/time';
import { useServerStore } from '@/stores/server';
import { Group, Title } from '@mantine/core';
import { useState } from 'react';
import { useSearchablePaginatedTable } from '@/plugins/useSearchablePageableTable';

export default () => {
  const [activities, setActivities] = useState<ResponseMeta<ServerActivity>>();
  const server = useServerStore((state) => state.server);

  const { loading, search, setSearch, setPage } = useSearchablePaginatedTable({
    fetcher: (page, search) => getServerActivity(server.uuid, page, search),
    setStoreData: setActivities,
  });

  return (
    <>
      <Group justify={'space-between'} mb={'md'}>
        <Title order={1} c={'white'}>
          Activity
        </Title>
        <TextInput placeholder={'Search...'} value={search} onChange={(e) => setSearch(e.target.value)} w={250} />
      </Group>

      {loading ? (
        <Spinner.Centered />
      ) : (
        <Table columns={['Actor', 'Event', 'IP', 'When', '']} pagination={activities} onPageSelect={setPage}>
          {activities.data.map((activity) => (
            <TableRow key={activity.created.toString()}>
              <TableData>
                {activity.user ? `${activity.user.username} (${activity.isApi ? 'API' : 'Web'})` : 'System'}
              </TableData>

              <TableData>
                <Code>{activity.event}</Code>
              </TableData>

              <TableData>{activity.ip && <Code>{activity.ip}</Code>}</TableData>

              <TableData>
                <Tooltip label={formatDateTime(activity.created)}>{formatTimestamp(activity.created)}</Tooltip>
              </TableData>

              <TableData>
                <Group gap={4} justify={'right'} wrap={'nowrap'}>
                  {Object.keys(activity.data).length > 0 ? <ActivityInfoButton activity={activity} /> : null}
                </Group>
              </TableData>
            </TableRow>
          ))}
        </Table>
      )}
    </>
  );
};

import { faCheckDouble, faPlus, faX } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ActionIcon, Group } from '@mantine/core';
import { MouseEvent as ReactMouseEvent, Ref, useCallback, useEffect, useMemo, useState } from 'react';
import getNodeAllocations from '@/api/admin/nodes/allocations/getNodeAllocations.ts';
import Button from '@/elements/Button.tsx';
import AdminContentContainer from '@/elements/containers/AdminContentContainer.tsx';
import Select from '@/elements/input/Select.tsx';
import SelectionArea from '@/elements/SelectionArea.tsx';
import Table from '@/elements/Table.tsx';
import Tooltip from '@/elements/Tooltip.tsx';
import { nodeAllocationTableColumns } from '@/lib/tableColumns.ts';
import { useKeyboardShortcuts } from '@/plugins/useKeyboardShortcuts.ts';
import { useSearchablePaginatedTable } from '@/plugins/useSearchablePageableTable.ts';
import { useAdminStore } from '@/stores/admin.tsx';
import AllocationActionBar from './AllocationActionBar.tsx';
import NodeAllocationsCreateModal from './modals/NodeAllocationsCreateModal.tsx';
import NodeAllocationRow from './NodeAllocationRow.tsx';

export default function AdminNodeAllocations({ node }: { node: Node }) {
  const { nodeAllocations, setNodeAllocations, selectedNodeAllocations, setSelectedNodeAllocations } = useAdminStore();

  const [openModal, setOpenModal] = useState<'create' | null>(null);
  const [selectedNodeAllocationsPrevious, setSelectedNodeAllocationsPrevious] = useState(selectedNodeAllocations);
  const [ipFilter, setIpFilter] = useState('');
  const [portFilter, setPortFilter] = useState('');

  const uniqueIps = useMemo(() => {
    const ips = new Set<string>();
    nodeAllocations.data.forEach((alloc) => ips.add(alloc.ip));
    return Array.from(ips)
      .sort()
      .map((ip) => ({ label: ip, value: ip }));
  }, [nodeAllocations.data]);

  const uniquePorts = useMemo(() => {
    const ports = new Set<string>();
    nodeAllocations.data.forEach((alloc) => ports.add(alloc.port.toString()));
    return Array.from(ports)
      .sort((a, b) => Number(a) - Number(b))
      .map((port) => ({ label: port, value: port }));
  }, [nodeAllocations.data]);

  const buildSearch = useCallback((generalSearch: string, ip: string, port: string) => {
    const parts: string[] = [];
    if (generalSearch) parts.push(generalSearch);
    if (ip) parts.push(ip);
    if (port) parts.push(port);
    return parts.length > 0 ? parts.join(':') : undefined;
  }, []);

  const { loading, search, setSearch, setPage, refetch } = useSearchablePaginatedTable({
    fetcher: (page, generalSearch) => {
      const finalSearch = buildSearch(generalSearch || '', ipFilter, portFilter);
      return getNodeAllocations(node.uuid, page, finalSearch);
    },
    setStoreData: setNodeAllocations,
    deps: [ipFilter, portFilter, node.uuid],
  });

  useEffect(() => {
    refetch();
  }, [ipFilter, portFilter]);

  const onSelectedStart = (event: ReactMouseEvent | MouseEvent) => {
    setSelectedNodeAllocationsPrevious(event.shiftKey ? selectedNodeAllocations : []);
  };

  const onSelected = (selected: NodeAllocation[]) => {
    setSelectedNodeAllocations([...selectedNodeAllocationsPrevious, ...selected]);
  };

  useEffect(() => {
    setSelectedNodeAllocations([]);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isInputFocused = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      if ((event.ctrlKey || event.metaKey) && event.key === 'Escape') {
        event.preventDefault();
        setSelectedNodeAllocations([]);
      }

      if ((event.ctrlKey || event.metaKey) && event.key === 'a' && !isInputFocused) {
        event.preventDefault();
        setSelectedNodeAllocations(nodeAllocations.data);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [nodeAllocations.data]);

  useKeyboardShortcuts({
    shortcuts: [
      {
        key: 'a',
        modifiers: ['ctrlOrMeta'],
        callback: () => setSelectedNodeAllocations(nodeAllocations.data),
      },
      {
        key: 'Escape',
        modifiers: ['ctrlOrMeta'],
        callback: () => setSelectedNodeAllocations([]),
      },
    ],
    deps: [nodeAllocations.data],
  });

  const handleSelectAll = () => {
    setSelectedNodeAllocations(nodeAllocations.data);
  };

  const handleClearSelection = () => {
    setSelectedNodeAllocations([]);
  };

  return (
    <AdminContentContainer
      title='Node Allocations'
      titleOrder={2}
      search={search}
      setSearch={setSearch}
      contentRight={
        <Group gap='xs'>
          <Select
            placeholder='IP'
            value={ipFilter || null}
            onChange={(value) => setIpFilter(value || '')}
            data={uniqueIps}
            searchable
            clearable
            allowDeselect
            w={120}
          />
          <Select
            placeholder='Port'
            value={portFilter || null}
            onChange={(value) => setPortFilter(value || '')}
            data={uniquePorts}
            searchable
            clearable
            allowDeselect
            w={100}
          />
          <Tooltip label='Select All'>
            <ActionIcon variant='subtle' onClick={handleSelectAll} color='gray'>
              <FontAwesomeIcon icon={faCheckDouble} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label='Clear Selection'>
            <ActionIcon
              variant='subtle'
              onClick={handleClearSelection}
              disabled={selectedNodeAllocations.length === 0}
              color='gray'
            >
              <FontAwesomeIcon icon={faX} />
            </ActionIcon>
          </Tooltip>
          <Button
            onClick={() => setOpenModal('create')}
            color='blue'
            size='sm'
            leftSection={<FontAwesomeIcon icon={faPlus} />}
          >
            Create
          </Button>
        </Group>
      }
    >
      <NodeAllocationsCreateModal
        node={node}
        loadAllocations={refetch}
        opened={openModal === 'create'}
        onClose={() => setOpenModal(null)}
      />

      <AllocationActionBar node={node} loadAllocations={refetch} />

      <SelectionArea onSelectedStart={onSelectedStart} onSelected={onSelected} disabled={!!openModal}>
        <Table
          columns={nodeAllocationTableColumns}
          loading={loading}
          pagination={nodeAllocations}
          onPageSelect={setPage}
          allowSelect={false}
        >
          {nodeAllocations.data.map((allocation) => (
            <SelectionArea.Selectable key={allocation.uuid} item={allocation}>
              {(innerRef: Ref<HTMLElement>) => (
                <NodeAllocationRow
                  key={allocation.uuid}
                  allocation={allocation}
                  ref={innerRef as Ref<HTMLTableRowElement>}
                />
              )}
            </SelectionArea.Selectable>
          ))}
        </Table>
      </SelectionArea>
    </AdminContentContainer>
  );
}

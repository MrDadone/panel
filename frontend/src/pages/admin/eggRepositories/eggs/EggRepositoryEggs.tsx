import { Ref, useCallback, useRef, useState } from 'react';
import getEggRepositoryEggs from '@/api/admin/egg-repositories/eggs/getEggRepositoryEggs.ts';
import { getEmptyPaginationSet } from '@/api/axios.ts';
import AdminSubContentContainer from '@/elements/containers/AdminSubContentContainer.tsx';
import SelectionArea from '@/elements/SelectionArea.tsx';
import Table from '@/elements/Table.tsx';
import { eggRepositoryEggTableColumns } from '@/lib/tableColumns.ts';
import { useKeyboardShortcuts } from '@/plugins/useKeyboardShortcuts.ts';
import { useSearchablePaginatedTable } from '@/plugins/useSearchablePageableTable.ts';
import EggActionBar from './EggActionBar.tsx';
import EggRepositoryEggRow from './EggRepositoryEggRow.tsx';

export default function EggRepositoryEggs({ contextEggRepository }: { contextEggRepository: AdminEggRepository }) {
  const [eggRepositoryEggs, setEggRepositoryEggs] = useState(getEmptyPaginationSet<AdminEggRepositoryEgg>());
  const [selectedEggs, setSelectedEggs] = useState<Set<string>>(new Set());
  const selectedEggsPreviousRef = useRef<Set<string>>(new Set());

  const onSelectedStart = useCallback(
    (event: React.MouseEvent | MouseEvent) => {
      selectedEggsPreviousRef.current = event.shiftKey ? selectedEggs : new Set();
    },
    [selectedEggs],
  );

  const onSelected = useCallback((selected: string[]) => {
    setSelectedEggs(new Set([...selectedEggsPreviousRef.current, ...selected]));
  }, []);

  const handleEggSelectionChange = useCallback((eggUuid: string, selected: boolean) => {
    setSelectedEggs((prev) => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(eggUuid);
      } else {
        newSet.delete(eggUuid);
      }
      return newSet;
    });
  }, []);

  const { loading, search, setSearch, setPage } = useSearchablePaginatedTable({
    fetcher: (page, search) => getEggRepositoryEggs(contextEggRepository.uuid, page, search),
    setStoreData: setEggRepositoryEggs,
  });

  useKeyboardShortcuts({
    shortcuts: [
      {
        key: 'a',
        modifiers: ['ctrlOrMeta'],
        callback: () => setSelectedEggs(new Set(eggRepositoryEggs.data.map((egg) => egg.uuid))),
      },
      {
        key: 'Escape',
        modifiers: ['ctrlOrMeta'],
        callback: () => setSelectedEggs(new Set()),
      },
    ],
    deps: [eggRepositoryEggs.data],
  });

  return (
    <AdminSubContentContainer title='Egg Repository Eggs' search={search} setSearch={setSearch} titleOrder={2}>
      <EggActionBar
        eggRepository={contextEggRepository}
        selectedEggs={selectedEggs}
        setSelectedEggs={setSelectedEggs}
      />

      <SelectionArea onSelectedStart={onSelectedStart} onSelected={onSelected}>
        <Table
          columns={eggRepositoryEggTableColumns}
          loading={loading}
          pagination={eggRepositoryEggs}
          onPageSelect={setPage}
          allowSelect={false}
        >
          {eggRepositoryEggs.data.map((eggRepositoryEgg) => (
            <SelectionArea.Selectable key={eggRepositoryEgg.uuid} item={eggRepositoryEgg.uuid}>
              {(innerRef: Ref<HTMLElement>) => (
                <EggRepositoryEggRow
                  key={eggRepositoryEgg.uuid}
                  eggRepository={contextEggRepository}
                  egg={eggRepositoryEgg}
                  ref={innerRef as Ref<HTMLTableRowElement>}
                  isSelected={selectedEggs.has(eggRepositoryEgg.uuid)}
                  onSelectionChange={(selected) => handleEggSelectionChange(eggRepositoryEgg.uuid, selected)}
                />
              )}
            </SelectionArea.Selectable>
          ))}
        </Table>
      </SelectionArea>
    </AdminSubContentContainer>
  );
}

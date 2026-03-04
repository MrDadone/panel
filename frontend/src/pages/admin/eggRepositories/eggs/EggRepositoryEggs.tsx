import { Ref, useCallback, useEffect, useRef, useState } from 'react';
import getEggRepositoryEggs from '@/api/admin/egg-repositories/eggs/getEggRepositoryEggs.ts';
import { getEmptyPaginationSet } from '@/api/axios.ts';
import AdminSubContentContainer from '@/elements/containers/AdminSubContentContainer.tsx';
import SelectionArea from '@/elements/SelectionArea.tsx';
import Table from '@/elements/Table.tsx';
import { ObjectSet } from '@/lib/objectSet.ts';
import { eggRepositoryEggTableColumns } from '@/lib/tableColumns.ts';
import { useKeyboardShortcuts } from '@/plugins/useKeyboardShortcuts.ts';
import { useSearchablePaginatedTable } from '@/plugins/useSearchablePageableTable.ts';
import EggActionBar from './EggActionBar.tsx';
import EggRepositoryEggRow from './EggRepositoryEggRow.tsx';

export default function EggRepositoryEggs({ contextEggRepository }: { contextEggRepository: AdminEggRepository }) {
  const [eggRepositoryEggs, setEggRepositoryEggs] = useState(getEmptyPaginationSet<AdminEggRepositoryEgg>());
  const [selectedEggs, setSelectedEggs] = useState(new ObjectSet<AdminEggRepositoryEgg, 'uuid'>('uuid'));
  const selectedEggsPreviousRef = useRef<AdminEggRepositoryEgg[]>([]);

  useEffect(() => {
    setSelectedEggs(new ObjectSet('uuid'));
  }, []);

  const onSelectedStart = useCallback(
    (event: React.MouseEvent | MouseEvent) => {
      selectedEggsPreviousRef.current = event.shiftKey ? selectedEggs.values() : [];
    },
    [selectedEggs],
  );

  const onSelected = useCallback((selected: AdminEggRepositoryEgg[]) => {
    setSelectedEggs(new ObjectSet('uuid', [...selectedEggsPreviousRef.current, ...selected.values()]));
  }, []);

  const handleEggSelectionChange = useCallback((egg: AdminEggRepositoryEgg, selected: boolean) => {
    setSelectedEggs((prev) => {
      const newSet = new ObjectSet('uuid', prev.values());
      if (selected) {
        newSet.add(egg);
      } else {
        newSet.delete(egg);
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
        callback: () => setSelectedEggs(new ObjectSet('uuid', eggRepositoryEggs.data)),
      },
      {
        key: 'Escape',
        callback: () => setSelectedEggs(new ObjectSet('uuid')),
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
            <SelectionArea.Selectable key={eggRepositoryEgg.uuid} item={eggRepositoryEgg}>
              {(innerRef: Ref<HTMLElement>) => (
                <EggRepositoryEggRow
                  key={eggRepositoryEgg.uuid}
                  eggRepository={contextEggRepository}
                  egg={eggRepositoryEgg}
                  ref={innerRef as Ref<HTMLTableRowElement>}
                  isSelected={selectedEggs.has(eggRepositoryEgg.uuid)}
                  onSelectionChange={(selected) => handleEggSelectionChange(eggRepositoryEgg, selected)}
                />
              )}
            </SelectionArea.Selectable>
          ))}
        </Table>
      </SelectionArea>
    </AdminSubContentContainer>
  );
}

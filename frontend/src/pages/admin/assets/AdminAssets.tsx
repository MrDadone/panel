import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MouseEvent as ReactMouseEvent, Ref, useCallback, useEffect, useRef, useState } from 'react';
import getAssets from '@/api/admin/assets/getAssets.ts';
import { AdminCan } from '@/elements/Can.tsx';
import AdminContentContainer from '@/elements/containers/AdminContentContainer.tsx';
import SelectionArea from '@/elements/SelectionArea.tsx';
import Spinner from '@/elements/Spinner.tsx';
import Table from '@/elements/Table.tsx';
import { assetTableColumns } from '@/lib/tableColumns.ts';
import AssetUpload from '@/pages/admin/assets/AssetUpload.tsx';
import { useKeyboardShortcuts } from '@/plugins/useKeyboardShortcuts.ts';
import AssetActionBar from './AssetActionBar.tsx';
import AssetRow from './AssetRow.tsx';

export default function AdminAssets() {
  const queryClient = useQueryClient();

  const selectedAssetsPreviousRef = useRef(new Set<string>());

  const [selectedAssets, setSelectedAssets] = useState(new Set<string>());
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'assets', { page }],
    queryFn: () => getAssets(page),
  });

  const invalidateAssets = () => {
    queryClient
      .invalidateQueries({
        queryKey: ['admin', 'assets'],
      })
      .catch((e) => console.error(e));
  };

  const onSelectedStart = useCallback(
    (event: ReactMouseEvent | MouseEvent) => {
      selectedAssetsPreviousRef.current = new Set(event.shiftKey ? selectedAssets : []);
    },
    [selectedAssets],
  );

  const onSelected = useCallback((selected: string[]) => {
    setSelectedAssets(new Set([...selectedAssetsPreviousRef.current, ...selected]));
  }, []);

  useEffect(() => {
    setSelectedAssets(new Set([]));
  }, []);

  const addSelectedAsset = (assetName: string) =>
    setSelectedAssets((prev) => {
      const next = new Set(prev);
      next.add(assetName);
      return next;
    });

  const removeSelectedAsset = (assetName: string) =>
    setSelectedAssets((prev) => {
      const next = new Set(prev);
      next.delete(assetName);
      return next;
    });

  useKeyboardShortcuts({
    shortcuts: [
      {
        key: 'a',
        modifiers: ['ctrlOrMeta'],
        callback: () => setSelectedAssets(new Set(data?.data.map((a) => a.name) ?? [])),
      },
      {
        key: 'Escape',
        modifiers: ['ctrlOrMeta'],
        callback: () => setSelectedAssets(new Set([])),
      },
    ],
    deps: [data],
  });

  return (
    <AdminContentContainer
      title='Assets'
      contentRight={
        <AdminCan action='assets.upload'>
          <AssetUpload invalidateAssets={invalidateAssets} />
        </AdminCan>
      }
    >
      <AssetActionBar
        selectedAssets={selectedAssets}
        invalidateAssets={() => {
          setSelectedAssets(new Set());
          invalidateAssets();
        }}
      />

      {!data || isLoading ? (
        <Spinner.Centered />
      ) : (
        <SelectionArea onSelectedStart={onSelectedStart} onSelected={onSelected}>
          <Table
            columns={assetTableColumns}
            loading={isLoading}
            pagination={data}
            onPageSelect={setPage}
            allowSelect={false}
          >
            {data.data.map((asset) => (
              <SelectionArea.Selectable key={asset.name} item={asset.name}>
                {(innerRef: Ref<HTMLElement>) => (
                  <AssetRow
                    key={asset.name}
                    asset={asset}
                    isSelected={selectedAssets.has(asset.name)}
                    addSelectedAsset={addSelectedAsset}
                    removeSelectedAsset={removeSelectedAsset}
                    ref={innerRef as Ref<HTMLTableRowElement>}
                  />
                )}
              </SelectionArea.Selectable>
            ))}
          </Table>
        </SelectionArea>
      )}
    </AdminContentContainer>
  );
}

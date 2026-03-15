import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MouseEvent as ReactMouseEvent, Ref, useCallback, useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import getAssets from '@/api/admin/assets/getAssets.ts';
import { AdminCan } from '@/elements/Can.tsx';
import AdminContentContainer from '@/elements/containers/AdminContentContainer.tsx';
import SelectionArea from '@/elements/SelectionArea.tsx';
import Spinner from '@/elements/Spinner.tsx';
import Table from '@/elements/Table.tsx';
import { ObjectSet } from '@/lib/objectSet.ts';
import { storageAssetSchema } from '@/lib/schemas/admin/assets.ts';
import { assetTableColumns } from '@/lib/tableColumns.ts';
import AssetUpload from '@/pages/admin/assets/AssetUpload.tsx';
import { useKeyboardShortcuts } from '@/plugins/useKeyboardShortcuts.ts';
import AssetActionBar from './AssetActionBar.tsx';
import AssetRow from './AssetRow.tsx';

export default function AdminAssets() {
  const queryClient = useQueryClient();

  const selectedAssetsPreviousRef = useRef<z.infer<typeof storageAssetSchema>[]>([]);

  const [selectedAssets, setSelectedAssets] = useState(
    new ObjectSet<z.infer<typeof storageAssetSchema>, 'name'>('name'),
  );
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
      selectedAssetsPreviousRef.current = event.shiftKey ? selectedAssets.values() : [];
    },
    [selectedAssets],
  );

  const onSelected = useCallback((selected: z.infer<typeof storageAssetSchema>[]) => {
    setSelectedAssets(new ObjectSet('name', [...selectedAssetsPreviousRef.current, ...selected.values()]));
  }, []);

  useEffect(() => {
    setSelectedAssets(new ObjectSet('name', []));
  }, []);

  const addSelectedAsset = (asset: z.infer<typeof storageAssetSchema>) =>
    setSelectedAssets((prev) => {
      const next = new ObjectSet('name', prev.values());
      next.add(asset);
      return next;
    });

  const removeSelectedAsset = (asset: z.infer<typeof storageAssetSchema>) =>
    setSelectedAssets((prev) => {
      const next = new ObjectSet('name', prev.values());
      next.delete(asset);
      return next;
    });

  useKeyboardShortcuts({
    shortcuts: [
      {
        key: 'a',
        modifiers: ['ctrlOrMeta'],
        callback: () => setSelectedAssets(new ObjectSet('name', data?.data)),
      },
      {
        key: 'Escape',
        callback: () => setSelectedAssets(new ObjectSet('name')),
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
          setSelectedAssets(new ObjectSet('name'));
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
              <SelectionArea.Selectable key={asset.name} item={asset}>
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

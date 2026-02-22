import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChangeEvent, MouseEvent as ReactMouseEvent, Ref, useCallback, useEffect, useRef, useState } from 'react';
import getAssets from '@/api/admin/assets/getAssets.ts';
import uploadAssets from '@/api/admin/assets/uploadAssets.ts';
import { httpErrorToHuman } from '@/api/axios.ts';
import Button from '@/elements/Button.tsx';
import { AdminCan } from '@/elements/Can.tsx';
import AdminContentContainer from '@/elements/containers/AdminContentContainer.tsx';
import SelectionArea from '@/elements/SelectionArea.tsx';
import Spinner from '@/elements/Spinner.tsx';
import Table from '@/elements/Table.tsx';
import { assetTableColumns } from '@/lib/tableColumns.ts';
import { useKeyboardShortcuts } from '@/plugins/useKeyboardShortcuts.ts';
import { useToast } from '@/providers/ToastProvider.tsx';
import AssetActionBar from './AssetActionBar.tsx';
import AssetRow from './AssetRow.tsx';

export default function AdminAssets() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const selectedAssetsPreviousRef = useRef(new Set<string>());
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;

    const form = new FormData();
    for (const file of files) {
      form.append(file.name, file);
    }

    event.target.value = '';

    uploadAssets(form)
      .then((assets) => {
        invalidateAssets();
        addToast(`${assets.length} Asset${assets.length === 1 ? '' : 's'} uploaded.`, 'success');
      })
      .catch((msg) => {
        addToast(httpErrorToHuman(msg), 'error');
      });
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
          <Button
            onClick={() => fileInputRef.current?.click()}
            color='blue'
            leftSection={<FontAwesomeIcon icon={faPlus} />}
          >
            Upload
          </Button>

          <input type='file' ref={fileInputRef} className='hidden' onChange={handleFileUpload} multiple />
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

import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  ChangeEvent,
  MouseEvent as ReactMouseEvent,
  Ref,
  startTransition,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import getAssets from '@/api/admin/assets/getAssets.ts';
import uploadAssets from '@/api/admin/assets/uploadAssets.ts';
import { httpErrorToHuman } from '@/api/axios.ts';
import Button from '@/elements/Button.tsx';
import { AdminCan } from '@/elements/Can.tsx';
import AdminContentContainer from '@/elements/containers/AdminContentContainer.tsx';
import SelectionArea from '@/elements/SelectionArea.tsx';
import Table from '@/elements/Table.tsx';
import { assetTableColumns } from '@/lib/tableColumns.ts';
import { useKeyboardShortcuts } from '@/plugins/useKeyboardShortcuts.ts';
import { useSearchablePaginatedTable } from '@/plugins/useSearchablePageableTable.ts';
import { useToast } from '@/providers/ToastProvider.tsx';
import { useAdminStore } from '@/stores/admin.tsx';
import AssetActionBar from './AssetActionBar.tsx';
import AssetRow from './AssetRow.tsx';

export default function AdminAssets() {
  const { assets, setAssets, addAssets, selectedAssets, setSelectedAssets } = useAdminStore();
  const { addToast } = useToast();

  const [selectedAssetsPrevious, setSelectedAssetsPrevious] = useState(selectedAssets);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { loading, setPage } = useSearchablePaginatedTable({
    fetcher: getAssets,
    setStoreData: setAssets,
  });

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
        addAssets(assets);
        addToast(`${assets.length} Asset${assets.length === 1 ? '' : 's'} uploaded.`, 'success');
      })
      .catch((msg) => {
        addToast(httpErrorToHuman(msg), 'error');
      });
  };

  const onSelectedStart = useCallback(
    (event: ReactMouseEvent | MouseEvent) => {
      setSelectedAssetsPrevious(event.shiftKey ? selectedAssets : []);
    },
    [selectedAssets],
  );

  const onSelected = useCallback(
    (selected: string[]) => {
      startTransition(() => {
        setSelectedAssets([...selectedAssetsPrevious, ...selected]);
      });
    },
    [selectedAssetsPrevious],
  );

  useEffect(() => {
    setSelectedAssets([]);
  }, []);

  useKeyboardShortcuts({
    shortcuts: [
      {
        key: 'a',
        modifiers: ['ctrlOrMeta'],
        callback: () => setSelectedAssets(assets.data.map((a) => a.name)),
      },
      {
        key: 'Escape',
        modifiers: ['ctrlOrMeta'],
        callback: () => setSelectedAssets([]),
      },
    ],
    deps: [assets.data],
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
      <AssetActionBar />

      <SelectionArea onSelectedStart={onSelectedStart} onSelected={onSelected}>
        <Table
          columns={assetTableColumns}
          loading={loading}
          pagination={assets}
          onPageSelect={setPage}
          allowSelect={false}
        >
          {assets.data.map((asset) => (
            <SelectionArea.Selectable key={asset.name} item={asset.name}>
              {(innerRef: Ref<HTMLElement>) => (
                <AssetRow key={asset.name} asset={asset} ref={innerRef as Ref<HTMLTableRowElement>} />
              )}
            </SelectionArea.Selectable>
          ))}
        </Table>
      </SelectionArea>
    </AdminContentContainer>
  );
}

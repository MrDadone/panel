import { forwardRef } from 'react';
import { NavLink } from 'react-router';
import Code from '@/elements/Code.tsx';
import Checkbox from '@/elements/input/Checkbox.tsx';
import { TableData, TableRow } from '@/elements/Table.tsx';
import FormattedTimestamp from '@/elements/time/FormattedTimestamp.tsx';
import { bytesToString } from '@/lib/size.ts';

interface AssetRowProps {
  asset: StorageAsset;
  isSelected: boolean;

  addSelectedAsset: (asset: StorageAsset) => void;
  removeSelectedAsset: (asset: StorageAsset) => void;
}

const AssetRow = forwardRef<HTMLTableRowElement, AssetRowProps>(function AssetRow(
  { asset, isSelected, addSelectedAsset, removeSelectedAsset },
  ref,
) {
  const toggleSelected = () => (isSelected ? removeSelectedAsset(asset) : addSelectedAsset(asset));

  return (
    <TableRow
      bg={isSelected ? 'var(--mantine-color-blue-light)' : undefined}
      onClick={(e) => {
        if (e.ctrlKey || e.metaKey) {
          addSelectedAsset(asset);
          return true;
        }

        return false;
      }}
      ref={ref}
    >
      <td className='pl-4 relative cursor-pointer w-10 text-center'>
        <Checkbox id={asset.name} checked={isSelected} onChange={toggleSelected} onClick={(e) => e.stopPropagation()} />
      </td>

      <TableData>
        <NavLink to={asset.url} target='_blank' className='text-blue-400 hover:text-blue-200 hover:underline'>
          <Code>{asset.name}</Code>
        </NavLink>
      </TableData>

      <TableData>{bytesToString(asset.size)}</TableData>

      <TableData>
        <FormattedTimestamp timestamp={asset.created} />
      </TableData>
    </TableRow>
  );
});

export default AssetRow;

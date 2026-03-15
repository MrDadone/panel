import { forwardRef } from 'react';
import { NavLink } from 'react-router';
import { z } from 'zod';
import Code from '@/elements/Code.tsx';
import Checkbox from '@/elements/input/Checkbox.tsx';
import { TableData, TableRow } from '@/elements/Table.tsx';
import FormattedTimestamp from '@/elements/time/FormattedTimestamp.tsx';
import { storageAssetSchema } from '@/lib/schemas/admin/assets.ts';
import { bytesToString } from '@/lib/size.ts';

interface AssetRowProps {
  asset: z.infer<typeof storageAssetSchema>;
  isSelected: boolean;

  addSelectedAsset: (asset: z.infer<typeof storageAssetSchema>) => void;
  removeSelectedAsset: (asset: z.infer<typeof storageAssetSchema>) => void;
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

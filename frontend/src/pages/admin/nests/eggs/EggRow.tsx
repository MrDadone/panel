import { forwardRef } from 'react';
import { NavLink } from 'react-router';
import Code from '@/elements/Code.tsx';
import Checkbox from '@/elements/input/Checkbox.tsx';
import { TableData, TableRow } from '@/elements/Table.tsx';
import FormattedTimestamp from '@/elements/time/FormattedTimestamp.tsx';

interface EggRowProps {
  nest: AdminNest;
  egg: AdminNestEgg;
  showSelection?: boolean;
  isSelected?: boolean;
  onSelectionChange?: (selected: boolean) => void;
}

const EggRow = forwardRef<HTMLTableRowElement, EggRowProps>(function EggRow(
  { nest, egg, showSelection, isSelected, onSelectionChange },
  ref,
) {
  return (
    <TableRow
      bg={isSelected ? 'var(--mantine-color-blue-light)' : undefined}
      onClick={(e) => {
        if (e.ctrlKey || e.metaKey) {
          onSelectionChange?.(true);
          return true;
        }

        return false;
      }}
      ref={ref}
    >
      {showSelection && (
        <TableData className='pl-4 relative cursor-pointer w-10 text-center'>
          <Checkbox
            id={egg.uuid}
            checked={isSelected}
            onChange={(e) => {
              onSelectionChange?.(e.target.checked);
            }}
            onClick={(e) => e.stopPropagation()}
            classNames={{ input: 'cursor-pointer!' }}
          />
        </TableData>
      )}

      <TableData>
        <NavLink
          to={`/admin/nests/${nest.uuid}/eggs/${egg.uuid}`}
          className='text-blue-400 hover:text-blue-200 hover:underline'
        >
          <Code>{egg.uuid}</Code>
        </NavLink>
      </TableData>

      <TableData>{egg.name}</TableData>

      <TableData>{egg.author}</TableData>

      <TableData>{egg.description}</TableData>

      <TableData>
        <FormattedTimestamp timestamp={egg.created} />
      </TableData>
    </TableRow>
  );
});

export default EggRow;

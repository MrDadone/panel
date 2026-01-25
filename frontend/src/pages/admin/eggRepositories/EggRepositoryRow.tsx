import { NavLink } from 'react-router';
import Code from '@/elements/Code.tsx';
import { TableData, TableRow } from '@/elements/Table.tsx';
import FormattedTimestamp from '@/elements/time/FormattedTimestamp.tsx';

export default function EggRepositoryRow({ eggRepository }: { eggRepository: AdminEggRepository }) {
  return (
    <TableRow>
      <TableData>
        <NavLink
          to={`/admin/egg-repositories/${eggRepository.uuid}`}
          className='text-blue-400 hover:text-blue-200 hover:underline'
        >
          <Code>{eggRepository.uuid}</Code>
        </NavLink>
      </TableData>

      <TableData>{eggRepository.name}</TableData>

      <TableData>{eggRepository.description}</TableData>

      <TableData>
        <Code>{eggRepository.gitRepository}</Code>
      </TableData>

      <TableData>
        <FormattedTimestamp timestamp={eggRepository.created} />
      </TableData>
    </TableRow>
  );
}

import { NavLink } from 'react-router';
import Code from '@/elements/Code.tsx';
import { TableData, TableRow } from '@/elements/Table.tsx';
import FormattedTimestamp from '@/elements/time/FormattedTimestamp.tsx';

export default function UserOAuthLinkRow({ userOAuthLink }: { userOAuthLink: AdminUserOAuthLink }) {
  return (
    <TableRow>
      <TableData>
        <Code>{userOAuthLink.uuid}</Code>
      </TableData>

      <TableData>
        <NavLink
          to={`/admin/users/${userOAuthLink.user.uuid}`}
          className='text-blue-400 hover:text-blue-200 hover:underline'
        >
          <Code>{userOAuthLink.user.username}</Code>
        </NavLink>
      </TableData>

      <TableData>
        <Code>{userOAuthLink.identifier}</Code>
      </TableData>

      <TableData>
        {!userOAuthLink.lastUsed ? 'N/A' : <FormattedTimestamp timestamp={userOAuthLink.lastUsed} />}
      </TableData>

      <TableData>
        <FormattedTimestamp timestamp={userOAuthLink.created} />
      </TableData>
    </TableRow>
  );
}

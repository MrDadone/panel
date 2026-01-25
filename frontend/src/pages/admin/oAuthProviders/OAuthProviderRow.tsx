import { NavLink } from 'react-router';
import Code from '@/elements/Code.tsx';
import { TableData, TableRow } from '@/elements/Table.tsx';
import FormattedTimestamp from '@/elements/time/FormattedTimestamp.tsx';

export default function OAuthProviderRow({ oauthProvider }: { oauthProvider: AdminOAuthProvider }) {
  return (
    <TableRow>
      <TableData>
        <NavLink
          to={`/admin/oauth-providers/${oauthProvider.uuid}`}
          className='text-blue-400 hover:text-blue-200 hover:underline'
        >
          <Code>{oauthProvider.uuid}</Code>
        </NavLink>
      </TableData>

      <TableData>{oauthProvider.name}</TableData>
      <TableData>{oauthProvider.enabled ? 'Yes' : 'No'}</TableData>
      <TableData>{oauthProvider.loginOnly ? 'Yes' : 'No'}</TableData>
      <TableData>{oauthProvider.linkViewable ? 'Yes' : 'No'}</TableData>
      <TableData>{oauthProvider.userManageable ? 'Yes' : 'No'}</TableData>
      <TableData>
        <FormattedTimestamp timestamp={oauthProvider.created} />
      </TableData>
    </TableRow>
  );
}

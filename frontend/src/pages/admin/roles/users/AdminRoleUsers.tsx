import { useState } from 'react';
import { z } from 'zod';
import getRoleUsers from '@/api/admin/roles/users/getRoleUsers.ts';
import { getEmptyPaginationSet } from '@/api/axios.ts';
import AdminSubContentContainer from '@/elements/containers/AdminSubContentContainer.tsx';
import Table from '@/elements/Table.tsx';
import { fullUserSchema, roleSchema } from '@/lib/schemas/user.ts';
import { userTableColumns } from '@/lib/tableColumns.ts';
import UserRow from '@/pages/admin/users/UserRow.tsx';
import { useSearchablePaginatedTable } from '@/plugins/useSearchablePageableTable.ts';

export default function AdminRoleUsers({ role }: { role: z.infer<typeof roleSchema> }) {
  const [roleUsers, setRoleUsers] = useState<Pagination<z.infer<typeof fullUserSchema>>>(getEmptyPaginationSet());

  const { loading, search, setSearch, setPage } = useSearchablePaginatedTable({
    fetcher: (page, search) => getRoleUsers(role.uuid, page, search),
    setStoreData: setRoleUsers,
  });

  return (
    <AdminSubContentContainer title='Role Users' titleOrder={2} search={search} setSearch={setSearch}>
      <Table columns={userTableColumns} loading={loading} pagination={roleUsers} onPageSelect={setPage}>
        {roleUsers.data.map((user) => (
          <UserRow key={user.uuid} user={user} />
        ))}
      </Table>
    </AdminSubContentContainer>
  );
}

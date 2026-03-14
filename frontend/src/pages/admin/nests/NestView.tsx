import { faCog, faEgg } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { z } from 'zod';
import getNest from '@/api/admin/nests/getNest.ts';
import { httpErrorToHuman } from '@/api/axios.ts';
import AdminContentContainer from '@/elements/containers/AdminContentContainer.tsx';
import Spinner from '@/elements/Spinner.tsx';
import SubNavigation from '@/elements/SubNavigation.tsx';
import { adminNestSchema } from '@/lib/schemas/admin/nests.ts';
import { useToast } from '@/providers/ToastProvider.tsx';
import AdminEggs from './eggs/AdminEggs.tsx';
import NestCreateOrUpdate from './NestCreateOrUpdate.tsx';

export default function NestView() {
  const params = useParams<'nestId'>();
  const { addToast } = useToast();
  const [nest, setNest] = useState<z.infer<typeof adminNestSchema> | null>(null);

  useEffect(() => {
    if (params.nestId) {
      getNest(params.nestId)
        .then((nest) => {
          setNest(nest);
        })
        .catch((msg) => {
          addToast(httpErrorToHuman(msg), 'error');
        });
    }
  }, [params.nestId]);

  return !nest ? (
    <Spinner.Centered />
  ) : (
    <AdminContentContainer title={nest.name}>
      <SubNavigation
        baseUrl={`/admin/nests/${params.nestId}`}
        items={[
          {
            name: 'General',
            icon: faCog,
            path: '/',
            element: <NestCreateOrUpdate contextNest={nest} />,
          },
          {
            name: 'Eggs',
            icon: faEgg,
            path: '/eggs/*',
            element: <AdminEggs contextNest={nest} />,
            permission: 'eggs.read',
          },
        ]}
      />
    </AdminContentContainer>
  );
}

import { faCog, faEgg } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import getEggRepository from '@/api/admin/egg-repositories/getEggRepository.ts';
import { httpErrorToHuman } from '@/api/axios.ts';
import AdminContentContainer from '@/elements/containers/AdminContentContainer.tsx';
import Spinner from '@/elements/Spinner.tsx';
import SubNavigation from '@/elements/SubNavigation.tsx';
import { useToast } from '@/providers/ToastProvider.tsx';
import EggRepositoryCreateOrUpdate from './EggRepositoryCreateOrUpdate.tsx';
import EggRepositoryEggs from './eggs/EggRepositoryEggs.tsx';

export default function EggRepositoryView() {
  const params = useParams<'eggRepositoryId'>();
  const { addToast } = useToast();
  const [eggRepository, setEggRepository] = useState<AdminEggRepository | null>(null);

  useEffect(() => {
    if (params.eggRepositoryId) {
      getEggRepository(params.eggRepositoryId)
        .then((eggRepository) => {
          setEggRepository(eggRepository);
        })
        .catch((msg) => {
          addToast(httpErrorToHuman(msg), 'error');
        });
    }
  }, [params.eggRepositoryId]);

  return !eggRepository ? (
    <Spinner.Centered />
  ) : (
    <AdminContentContainer title={eggRepository.name}>
      <SubNavigation
        baseUrl={`/admin/egg-repositories/${params.eggRepositoryId}`}
        items={[
          {
            name: 'General',
            icon: faCog,
            path: '/',
            element: <EggRepositoryCreateOrUpdate contextEggRepository={eggRepository} />,
          },
          {
            name: 'Eggs',
            icon: faEgg,
            path: `/eggs`,
            element: <EggRepositoryEggs contextEggRepository={eggRepository} />,
          },
        ]}
      />
    </AdminContentContainer>
  );
}

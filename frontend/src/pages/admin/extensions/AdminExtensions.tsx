import { useEffect, useState } from 'react';
import getAdminExtensions from '@/api/admin/extensions/getAdminExtensions.ts';
import { httpErrorToHuman } from '@/api/axios.ts';
import AdminContentContainer from '@/elements/containers/AdminContentContainer.tsx';
import Spinner from '@/elements/Spinner.tsx';
import { useToast } from '@/providers/ToastProvider.tsx';
import ExtensionCard from './ExtensionCard.tsx';

export default function AdminExtensions() {
  const { addToast } = useToast();
  const [backendExtensions, setBackendExtensions] = useState<AdminBackendExtension[] | null>(null);

  useEffect(() => {
    getAdminExtensions()
      .then((extensions) => {
        setBackendExtensions(extensions);
      })
      .catch((err) => {
        addToast(httpErrorToHuman(err), 'error');
      });
  }, []);

  return (
    <AdminContentContainer title='Extensions'>
      {!backendExtensions ? (
        <Spinner.Centered />
      ) : !backendExtensions.length ? (
        <span>No extensions installed.</span>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {window.extensionContext.extensions.map((extension) => (
            <ExtensionCard
              key={extension.packageName}
              extension={extension}
              backendExtension={backendExtensions.find((e) => e.metadataToml.packageName === extension.packageName)}
            />
          ))}
        </div>
      )}
    </AdminContentContainer>
  );
}

import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMemo } from 'react';
import { Link, useParams } from 'react-router';
import AdminContentContainer from '@/elements/containers/AdminContentContainer.tsx';

export default function AdminExtensionsExtension() {
  const { packageName } = useParams<'packageName'>();

  const extension = useMemo(() => {
    return window.extensionContext.extensions.find((ext) => ext.packageName === packageName);
  }, [packageName]);

  if (!extension) {
    return (
      <AdminContentContainer title='Extension Not Found'>
        <span>Extension with package name "{packageName}" not found.</span>
      </AdminContentContainer>
    );
  }

  return (
    <AdminContentContainer title={`Configure ${extension.packageName}`}>
      <Link to='/admin/extensions' className='text-sm text-blue-400 hover:underline'>
        <FontAwesomeIcon icon={faArrowLeft} /> Back to Extensions
      </Link>

      {extension.cardConfigurationPage ? (
        <extension.cardConfigurationPage />
      ) : (
        <span>This extension does not have a configuration page.</span>
      )}
    </AdminContentContainer>
  );
}

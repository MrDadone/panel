import { faPuzzlePiece, faWrench } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Title } from '@mantine/core';
import { Link } from 'react-router';
import { Extension } from 'shared';
import Badge from '@/elements/Badge.tsx';
import Button from '@/elements/Button.tsx';
import ConditionalTooltip from '@/elements/ConditionalTooltip.tsx';
import Divider from '@/elements/Divider.tsx';
import TitleCard from '@/elements/TitleCard.tsx';

export default function ExtensionCard({
  extension,
  backendExtension,
}: {
  extension?: Extension;
  backendExtension?: AdminBackendExtension;
}) {
  return (
    <TitleCard
      title={backendExtension?.metadataToml.name || extension?.packageName || 'Unknown Extension'}
      icon={<FontAwesomeIcon icon={faPuzzlePiece} />}
      className='w-xl'
    >
      <div className='flex flex-col'>
        <div className='flex flex-row'>
          {!extension && (
            <Badge color='red' variant='light' className='mb-2'>
              Extension frontend missing
            </Badge>
          )}
          {!backendExtension && (
            <Badge color='red' variant='light' className='mb-2'>
              Extension backend missing
            </Badge>
          )}
        </div>

        {backendExtension && (
          <div className='flex flex-col'>
            <div className='flex flex-row justify-between items-center'>
              <Title order={4} c='white'>
                Package Name
              </Title>
              <span>{backendExtension.metadataToml.packageName}</span>
            </div>
            <div className='flex flex-row justify-between items-center'>
              <Title order={4} c='white'>
                Version
              </Title>
              <span>{backendExtension.version}</span>
            </div>
            <div className='flex flex-row justify-between items-center'>
              <Title order={4} c='white'>
                Authors
              </Title>
              <span>{backendExtension.authors.join(', ') || 'Unknown'}</span>
            </div>
            <p className='mt-2'>{backendExtension.description}</p>
          </div>
        )}

        {extension?.cardComponent ? (
          <>
            <Divider className='my-2' />
            <extension.cardComponent />
            <Divider className='mt-2 mb-4' />
          </>
        ) : (
          <Divider className='mt-2 mb-4' />
        )}

        <ConditionalTooltip
          enabled={!backendExtension || !extension?.cardConfigurationPage}
          label={
            !backendExtension
              ? 'Backend extension is required to configure this extension.'
              : 'This extension does not have a configuration page defined.'
          }
        >
          <Link to={`/admin/extensions/${extension?.packageName}`} className='w-full block'>
            <Button
              leftSection={<FontAwesomeIcon icon={faWrench} />}
              disabled={!backendExtension || !extension?.cardConfigurationPage}
              className='w-full!'
            >
              Configure
            </Button>
          </Link>
        </ConditionalTooltip>
      </div>
    </TitleCard>
  );
}

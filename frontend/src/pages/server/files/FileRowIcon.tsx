import { faFile, faFolder } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { memo } from 'react';

function FileRowIcon({ file, className }: { file?: DirectoryEntry | null; className?: string }) {
  return <FontAwesomeIcon className={className} icon={file?.directory ? faFolder : faFile} />;
}

export default memo(FileRowIcon);

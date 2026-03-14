import { faFile, faFilePen, faFolder, faFolderTree, faImage, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { memo } from 'react';
import { z } from 'zod';
import { isEditableFile, isViewableArchive, isViewableImage } from '@/lib/files.ts';
import { serverDirectoryEntrySchema } from '@/lib/schemas/server/files.ts';

function getFileIcon(file: z.infer<typeof serverDirectoryEntrySchema>): IconDefinition {
  for (const handler of window.extensionContext.extensionRegistry.pages.server.files.fileIconHandlers) {
    const icon = handler(file);
    if (icon) {
      return icon;
    }
  }

  if (file.directory) {
    return faFolder;
  }

  if (isViewableImage(file)) {
    return faImage;
  } else if (isViewableArchive(file)) {
    return faFolderTree;
  } else if (isEditableFile(file)) {
    return faFilePen;
  }

  return faFile;
}

function FileRowIcon({
  file,
  className,
}: {
  file?: z.infer<typeof serverDirectoryEntrySchema> | null;
  className?: string;
}) {
  return <FontAwesomeIcon className={className} icon={file ? getFileIcon(file) : faFile} />;
}

export default memo(FileRowIcon);

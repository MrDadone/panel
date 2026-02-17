import FileUploadOverlay from '@/pages/server/files/FileUploadOverlay.tsx';
import { useFileDragAndDrop } from '@/pages/server/files/hooks/useFileDragAndDrop.ts';
import { useFileUpload } from '@/plugins/useFileUpload.ts';
import { useFileManager } from '@/providers/contexts/fileManagerContext.ts';
import { useServerStore } from '@/stores/server.ts';

export default function FileUpload() {
  const { fileUploader } = useFileManager();
  const { uploadFiles, handleFileSelect, handleFolderSelect } = fileUploader;
  const { browsingBackup, fileInputRef, folderInputRef } = useFileManager();

  const { isDragging } = useFileDragAndDrop({
    onDrop: uploadFiles,
    enabled: !browsingBackup,
  });

  return (
    <>
      <input
        ref={fileInputRef}
        type='file'
        multiple
        style={{ display: 'none' }}
        onChange={(e) => handleFileSelect(e, fileInputRef)}
      />
      <input
        ref={folderInputRef}
        type='file'
        multiple
        style={{ display: 'none' }}
        onChange={(e) => handleFolderSelect(e, folderInputRef)}
        {...{ webkitdirectory: '', directory: '' }}
      />

      <FileUploadOverlay visible={isDragging && !browsingBackup} />
    </>
  );
}

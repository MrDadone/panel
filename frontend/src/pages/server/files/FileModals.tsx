import DirectoryNameModal from '@/pages/server/filesold/modals/DirectoryNameModal.tsx';
import PullFileModal from '@/pages/server/filesold/modals/PullFileModal.tsx';
import SftpDetailsModal from '@/pages/server/filesold/modals/SftpDetailsModal.tsx';
import ArchiveCreateModal from '@/pages/server/files/modals/ArchiveCreateModal.tsx';
import FileCopyModal from '@/pages/server/files/modals/FileCopyModal.tsx';
import FileDeleteModal from '@/pages/server/files/modals/FileDeleteModal.tsx';
import FilePermissionsModal from '@/pages/server/files/modals/FilePermissionsModal.tsx';
import FileRenameModal from '@/pages/server/files/modals/FileRenameModal.tsx';
import { useFileManager } from '@/providers/contexts/fileManagerContext.ts';

export default function FileModals() {
  const { openModal, modalDirectoryEntry, doCloseModal } = useFileManager();

  return (
    <>
      <FileCopyModal file={modalDirectoryEntry} opened={openModal === 'copy'} onClose={doCloseModal} />
      <FileRenameModal file={modalDirectoryEntry} opened={openModal === 'rename'} onClose={doCloseModal} />
      <FilePermissionsModal file={modalDirectoryEntry} opened={openModal === 'permissions'} onClose={doCloseModal} />
      <ArchiveCreateModal
        files={modalDirectoryEntry ? [modalDirectoryEntry] : []}
        opened={openModal === 'archive'}
        onClose={doCloseModal}
      />
      <FileDeleteModal
        files={modalDirectoryEntry ? [modalDirectoryEntry] : []}
        opened={openModal === 'delete'}
        onClose={doCloseModal}
      />

      <SftpDetailsModal opened={openModal === 'sftpDetails'} onClose={doCloseModal} />
      <DirectoryNameModal opened={openModal === 'nameDirectory'} onClose={doCloseModal} />
      <PullFileModal opened={openModal === 'pullFile'} onClose={doCloseModal} />
    </>
  );
}

import { ReactNode, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useFileDragAndDrop } from '@/pages/server/files/hooks/useFileDragAndDrop.ts';
import { useFileUpload } from '@/plugins/useFileUpload.ts';
import { FileManagerContext, ModalType } from '@/providers/contexts/fileManagerContext.ts';
import { useServerStore } from '@/stores/server.ts';

const FileManagerProvider = ({ children }: { children: ReactNode }) => {
  const [searchParams, _] = useSearchParams();
  const { server } = useServerStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const [selectedFileNames, setSelectedFileNames] = useState(new Set<string>());
  const [browsingDirectory, setBrowsingDirectory] = useState('');
  const [browsingEntries, setBrowsingEntries] = useState<DirectoryEntry[]>([]);
  const [page, setPage] = useState(1);
  const [browsingWritableDirectory, setBrowsingWritableDirectory] = useState(true);
  const [browsingFastDirectory, setBrowsingFastDirectory] = useState(true);
  const [openModal, setOpenModal] = useState<ModalType>(null);
  const [modalDirectoryEntry, setModalDirectoryEntry] = useState<DirectoryEntry | null>(null);

  const fileUploader = useFileUpload(server.uuid, browsingDirectory!, () => console.log('done'));

  const setSelectedFiles = (files: string[]) => setSelectedFileNames(new Set(files));

  const addSelectedFile = (file: DirectoryEntry) => {
    setSelectedFileNames((prev) => {
      const next = new Set(prev);
      next.add(file.name);
      return next;
    });
  };

  const removeSelectedFile = (file: DirectoryEntry) => {
    setSelectedFileNames((prev) => {
      const next = new Set(prev);
      next.delete(file.name);
      return next;
    });
  };

  const doOpenModal = (modal: ModalType, entry?: DirectoryEntry) => {
    setOpenModal(modal);
    if (entry) {
      setModalDirectoryEntry(entry);
    }
  };

  const doCloseModal = () => {
    setOpenModal(null);
    setModalDirectoryEntry(null);
  };

  useEffect(() => {
    setBrowsingDirectory(searchParams.get('directory') || '/');
    setPage(Number(searchParams.get('page')) || 1);
  }, [searchParams]);

  useEffect(() => {
    setSelectedFiles([]);
  }, [browsingDirectory]);

  return (
    <FileManagerContext.Provider
      value={{
        fileInputRef,
        folderInputRef,
        selectedFileNames,
        browsingDirectory,
        browsingEntries,
        page,
        browsingWritableDirectory,
        browsingFastDirectory,
        openModal,
        modalDirectoryEntry,
        setSelectedFiles,
        addSelectedFile,
        removeSelectedFile,
        setBrowsingDirectory,
        setBrowsingEntries,
        setPage,
        setBrowsingWritableDirectory,
        setBrowsingFastDirectory,
        doOpenModal,
        doCloseModal,
        setModalDirectoryEntry,
        fileUploader,
      }}
    >
      {children}
    </FileManagerContext.Provider>
  );
};

export { FileManagerProvider };
export { useFileManager } from './contexts/fileManagerContext.ts';

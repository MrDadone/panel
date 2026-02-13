import { ReactNode, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { FileManagerContext, ModalType } from '@/providers/contexts/fileManagerContext.ts';

const FileManagerProvider = ({ children }: { children: ReactNode }) => {
  const [searchParams, _] = useSearchParams();

  const [selectedFileNames, setSelectedFileNames] = useState(new Set<string>());
  const [browsingDirectory, setBrowsingDirectory] = useState('');
  const [browsingEntries, setBrowsingEntries] = useState<DirectoryEntry[]>([]);
  const [page, setPage] = useState(1);
  const [browsingFastDirectory, setBrowsingFastDirectory] = useState(true);

  const [openModal, setOpenModal] = useState<ModalType>(null);
  const [modalDirectoryEntry, setModalDirectoryEntry] = useState<DirectoryEntry | null>(null);

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

  const doOpenModal = (modal: ModalType, entry: DirectoryEntry) => {
    setOpenModal(modal);
    setModalDirectoryEntry(entry);
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
        selectedFileNames,
        browsingDirectory,
        browsingEntries,
        page,
        browsingFastDirectory,
        openModal,
        modalDirectoryEntry,
        setSelectedFiles,
        addSelectedFile,
        removeSelectedFile,
        setBrowsingDirectory,
        setBrowsingEntries,
        setPage,
        setBrowsingFastDirectory,
        doOpenModal,
        doCloseModal,
        setModalDirectoryEntry,
      }}
    >
      {children}
    </FileManagerContext.Provider>
  );
};

export { FileManagerProvider };
export { useFileManager } from './contexts/fileManagerContext.ts';

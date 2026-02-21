import { useQueryClient } from '@tanstack/react-query';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { getEmptyPaginationSet } from '@/api/axios.ts';
import { useFileUpload } from '@/plugins/useFileUpload.ts';
import { FileManagerContext, ModalType, SearchInfo } from '@/providers/contexts/fileManagerContext.ts';
import { useServerStore } from '@/stores/server.ts';

const FileManagerProvider = ({ children }: { children: ReactNode }) => {
  const [searchParams, _] = useSearchParams();
  const { server } = useServerStore();
  const queryClient = useQueryClient();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const [selectedFileNames, setSelectedFileNames] = useState(new Set<string>());
  const [browsingBackup, setBrowsingBackup] = useState<ServerBackup | null>(null);
  const [browsingDirectory, setBrowsingDirectory] = useState('');
  const [browsingEntries, setBrowsingEntries] = useState<ResponseMeta<DirectoryEntry>>(getEmptyPaginationSet());
  const [page, setPage] = useState(1);
  const [browsingWritableDirectory, setBrowsingWritableDirectory] = useState(true);
  const [browsingFastDirectory, setBrowsingFastDirectory] = useState(true);
  const [openModal, setOpenModal] = useState<ModalType>(null);
  const [modalDirectoryEntry, setModalDirectoryEntry] = useState<DirectoryEntry | null>(null);
  const [searchInfo, setSearchInfo] = useState<SearchInfo | null>(null);
  const [clickOnce, setClickOnce] = useState(localStorage.getItem('file_click_once') !== 'false');

  const invalidateFilemanager = () => {
    queryClient
      .invalidateQueries({
        queryKey: ['server', server.uuid, 'files'],
      })
      .catch((e) => console.error(e));
  };

  const fileUploader = useFileUpload(server.uuid, browsingDirectory!, invalidateFilemanager);

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
        browsingBackup,
        browsingDirectory,
        browsingEntries,
        page,
        browsingWritableDirectory,
        browsingFastDirectory,
        openModal,
        modalDirectoryEntry,
        searchInfo,
        clickOnce,
        setSelectedFiles,
        addSelectedFile,
        removeSelectedFile,
        setBrowsingBackup,
        setBrowsingDirectory,
        setBrowsingEntries,
        setPage,
        setBrowsingWritableDirectory,
        setBrowsingFastDirectory,
        doOpenModal,
        doCloseModal,
        setModalDirectoryEntry,
        setSearchInfo,
        setClickOnce,
        fileUploader,
        invalidateFilemanager,
      }}
    >
      {children}
    </FileManagerContext.Provider>
  );
};

export { FileManagerProvider };
export { useFileManager } from './contexts/fileManagerContext.ts';

import { useQueryClient } from '@tanstack/react-query';
import { AxiosRequestConfig } from 'axios';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { axiosInstance, getEmptyPaginationSet } from '@/api/axios.ts';
import getFileUploadUrl from '@/api/server/files/getFileUploadUrl.ts';
import { useFileUpload } from '@/plugins/useFileUpload.ts';
import { ActingFileMode, FileManagerContext, ModalType, SearchInfo } from '@/providers/contexts/fileManagerContext.ts';
import { useServerStore } from '@/stores/server.ts';

const FileManagerProvider = ({ children }: { children: ReactNode }) => {
  const [searchParams, _] = useSearchParams();
  const { server } = useServerStore();
  const queryClient = useQueryClient();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const [actingMode, setActingMode] = useState<ActingFileMode | null>(null);
  const [actingFiles, setActingFiles] = useState(new Set<DirectoryEntry>());
  const [actingFilesSource, setActingFilesSource] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState(new Set<DirectoryEntry>());
  const [browsingBackup, setBrowsingBackup] = useState<ServerBackup | null>(null);
  const [browsingDirectory, setBrowsingDirectory] = useState('');
  const [browsingEntries, setBrowsingEntries] = useState<ResponseMeta<DirectoryEntry>>(getEmptyPaginationSet());
  const [page, setPage] = useState(1);
  const [browsingWritableDirectory, setBrowsingWritableDirectory] = useState(true);
  const [browsingFastDirectory, setBrowsingFastDirectory] = useState(true);
  const [openModal, setOpenModal] = useState<ModalType>(null);
  const [modalDirectoryEntries, setModalDirectoryEntries] = useState<DirectoryEntry[]>([]);
  const [searchInfo, setSearchInfo] = useState<SearchInfo | null>(null);
  const [clickOnce, setClickOnce] = useState(localStorage.getItem('file_click_once') !== 'false');

  const invalidateFilemanager = () => {
    queryClient
      .invalidateQueries({
        queryKey: ['server', server.uuid, 'files'],
      })
      .catch((e) => console.error(e));
  };

  const doUpload = async (form: FormData, config: AxiosRequestConfig) => {
    const { url } = await getFileUploadUrl(server.uuid, browsingDirectory);
    return axiosInstance.post(url, form, config);
  };

  const fileUploader = useFileUpload(doUpload, invalidateFilemanager);

  const doActFiles = (mode: ActingFileMode | null, files: DirectoryEntry[]) => {
    setActingMode(mode);
    setActingFiles(new Set(files));
    setActingFilesSource(browsingDirectory);
  };

  const clearActingFiles = () => {
    setActingMode(null);
    setActingFiles(new Set());
    setActingFilesSource(null);
  };

  const doSelectFiles = (files: DirectoryEntry[]) => setSelectedFiles(new Set(files));

  const addSelectedFile = (file: DirectoryEntry) => {
    setSelectedFiles((prev) => {
      const next = new Set(prev);
      next.add(file);
      return next;
    });
  };

  const removeSelectedFile = (file: DirectoryEntry) => {
    setSelectedFiles((prev) => {
      const next = new Set(prev);
      next.delete(file);
      return next;
    });
  };

  const doOpenModal = (modal: ModalType, entries?: DirectoryEntry[]) => {
    setOpenModal(modal);
    if (entries) {
      setModalDirectoryEntries(entries);
    }
  };

  const doCloseModal = () => {
    setOpenModal(null);
    setModalDirectoryEntries([]);
  };

  useEffect(() => {
    setBrowsingDirectory(searchParams.get('directory') || '/');
    setPage(Number(searchParams.get('page')) || 1);
  }, [searchParams]);

  useEffect(() => {
    setSelectedFiles(new Set());
  }, [browsingDirectory]);

  return (
    <FileManagerContext.Provider
      value={{
        fileInputRef,
        folderInputRef,

        actingMode,
        setActingMode,
        actingFiles,
        setActingFiles,
        actingFilesSource,
        setActingFilesSource,
        selectedFiles,
        setSelectedFiles,
        browsingBackup,
        setBrowsingBackup,
        browsingDirectory,
        setBrowsingDirectory,
        browsingEntries,
        setBrowsingEntries,
        page,
        setPage,
        browsingWritableDirectory,
        setBrowsingWritableDirectory,
        browsingFastDirectory,
        setBrowsingFastDirectory,
        openModal,
        setOpenModal,
        modalDirectoryEntries,
        setModalDirectoryEntries,
        searchInfo,
        setSearchInfo,
        clickOnce,
        setClickOnce,

        invalidateFilemanager,
        fileUploader,
        doActFiles,
        clearActingFiles,
        doSelectFiles,
        addSelectedFile,
        removeSelectedFile,
        doOpenModal,
        doCloseModal,
      }}
    >
      {children}
    </FileManagerContext.Provider>
  );
};

export { FileManagerProvider };
export { useFileManager } from './contexts/fileManagerContext.ts';

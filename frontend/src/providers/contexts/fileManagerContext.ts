import { createContext, RefObject, useContext } from 'react';
import { z } from 'zod';
import { serverFilesSearchSchema } from '@/lib/schemas/server/files.ts';
import { FileUploader } from '@/plugins/useFileUpload.ts';

export type ModalType =
  | 'rename'
  | 'copy'
  | 'permissions'
  | 'archive'
  | 'delete'
  | 'sftpDetails'
  | 'nameDirectory'
  | 'pullFile'
  | 'search'
  | null;

export interface SearchInfo {
  query?: string;
  filters: z.infer<typeof serverFilesSearchSchema>;
}

export interface FileManagerContextType {
  fileInputRef: RefObject<HTMLInputElement | null>;
  folderInputRef: RefObject<HTMLInputElement | null>;

  selectedFileNames: Set<string>;
  browsingBackup: ServerBackup | null;
  browsingDirectory: string;
  browsingEntries: ResponseMeta<DirectoryEntry>;
  page: number;
  browsingWritableDirectory: boolean;
  browsingFastDirectory: boolean;
  openModal: ModalType;
  modalDirectoryEntry: DirectoryEntry | null;
  searchInfo: SearchInfo | null;

  setSelectedFiles: (files: string[]) => void;
  addSelectedFile: (file: DirectoryEntry) => void;
  removeSelectedFile: (file: DirectoryEntry) => void;
  setBrowsingBackup: (backup: ServerBackup | null) => void;
  setBrowsingDirectory: (directory: string) => void;
  setBrowsingEntries: (entries: ResponseMeta<DirectoryEntry>) => void;
  setPage: (page: number) => void;
  setBrowsingWritableDirectory: (value: boolean) => void;
  setBrowsingFastDirectory: (value: boolean) => void;
  doOpenModal: (modal: ModalType, entry?: DirectoryEntry) => void;
  doCloseModal: () => void;
  setModalDirectoryEntry: (directoryEntry: DirectoryEntry) => void;
  setSearchInfo: (info: SearchInfo | null) => void;

  fileUploader: FileUploader;
  invalidateFilemanager: () => void;
}

export const FileManagerContext = createContext<FileManagerContextType | undefined>(undefined);

export const useFileManager = () => {
  const context = useContext(FileManagerContext);
  if (!context) {
    throw new Error('useFileManager must be used within a FileManagerProvider');
  }
  return context;
};

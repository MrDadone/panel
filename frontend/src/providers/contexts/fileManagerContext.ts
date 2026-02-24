import { createContext, RefObject, useContext } from 'react';
import { z } from 'zod';
import { serverFilesSearchSchema } from '@/lib/schemas/server/files.ts';
import { FileUploader } from '@/plugins/useFileUpload.ts';

export type ModalType =
  | 'rename'
  | 'copy'
  | 'copy-remote'
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

export type ActingFileMode = 'copy' | 'move';

export interface FileManagerContextType {
  fileInputRef: RefObject<HTMLInputElement | null>;
  folderInputRef: RefObject<HTMLInputElement | null>;

  actingMode: ActingFileMode | null;
  setActingMode: (actingMode: ActingFileMode, files: DirectoryEntry[]) => void;
  actingFiles: Set<DirectoryEntry>;
  setActingFiles: (files: Set<DirectoryEntry>) => void;
  actingFilesSource: string | null;
  setActingFilesSource: (directory: string | null) => void;
  selectedFiles: Set<DirectoryEntry>;
  setSelectedFiles: (files: Set<DirectoryEntry>) => void;
  browsingBackup: ServerBackup | null;
  setBrowsingBackup: (backup: ServerBackup | null) => void;
  browsingDirectory: string;
  setBrowsingDirectory: (directory: string) => void;
  browsingEntries: ResponseMeta<DirectoryEntry>;
  setBrowsingEntries: (entries: ResponseMeta<DirectoryEntry>) => void;
  page: number;
  setPage: (page: number) => void;
  browsingWritableDirectory: boolean;
  setBrowsingWritableDirectory: (state: boolean) => void;
  browsingFastDirectory: boolean;
  setBrowsingFastDirectory: (state: boolean) => void;
  openModal: ModalType;
  setOpenModal: (modal: ModalType) => void;
  modalDirectoryEntries: DirectoryEntry[];
  setModalDirectoryEntries: (files: DirectoryEntry[]) => void;
  searchInfo: SearchInfo | null;
  setSearchInfo: (info: SearchInfo | null) => void;
  clickOnce: boolean;
  setClickOnce: (state: boolean) => void;

  invalidateFilemanager: () => void;
  fileUploader: FileUploader;
  doActFiles: (mode: ActingFileMode | null, files: DirectoryEntry[]) => void;
  clearActingFiles: () => void;
  doSelectFiles: (files: DirectoryEntry[]) => void;
  addSelectedFile: (file: DirectoryEntry) => void;
  removeSelectedFile: (file: DirectoryEntry) => void;
  doOpenModal: (modal: ModalType, entries?: DirectoryEntry[]) => void;
  doCloseModal: () => void;
}

export const FileManagerContext = createContext<FileManagerContextType | undefined>(undefined);

export const useFileManager = () => {
  const context = useContext(FileManagerContext);
  if (!context) {
    throw new Error('useFileManager must be used within a FileManagerProvider');
  }
  return context;
};

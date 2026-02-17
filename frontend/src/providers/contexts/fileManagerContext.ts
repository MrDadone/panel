import { createContext, RefObject, useContext } from 'react';
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
  | null;

export interface FileManagerContextType {
  fileInputRef: RefObject<HTMLInputElement | null>;
  folderInputRef: RefObject<HTMLInputElement | null>;

  selectedFileNames: Set<string>;
  browsingDirectory: string;
  browsingEntries: DirectoryEntry[];
  page: number;
  browsingWritableDirectory: boolean;
  browsingFastDirectory: boolean;
  openModal: ModalType;
  modalDirectoryEntry: DirectoryEntry | null;

  setSelectedFiles: (files: string[]) => void;
  addSelectedFile: (file: DirectoryEntry) => void;
  removeSelectedFile: (file: DirectoryEntry) => void;
  setBrowsingDirectory: (directory: string) => void;
  setBrowsingEntries: (entries: DirectoryEntry[]) => void;
  setPage: (page: number) => void;
  setBrowsingWritableDirectory: (value: boolean) => void;
  setBrowsingFastDirectory: (value: boolean) => void;
  doOpenModal: (modal: ModalType, entry?: DirectoryEntry) => void;
  doCloseModal: () => void;
  setModalDirectoryEntry: (directoryEntry: DirectoryEntry) => void;

  fileUploader: FileUploader;
}

export const FileManagerContext = createContext<FileManagerContextType | undefined>(undefined);

export const useFileManager = () => {
  const context = useContext(FileManagerContext);
  if (!context) {
    throw new Error('useFileManager must be used within a FileManagerProvider');
  }
  return context;
};

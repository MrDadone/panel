import { createContext, useContext } from 'react';

export interface FileManagerContextType {
  selectedFileNames: Set<string>;
  browsingDirectory: string;
  browsingEntries: DirectoryEntry[];
  page: number;
  browsingFastDirectory: boolean;

  setSelectedFiles: (files: string[]) => void;
  addSelectedFile: (file: DirectoryEntry) => void;
  removeSelectedFile: (file: DirectoryEntry) => void;
  setBrowsingDirectory: (directory: string) => void;
  setBrowsingEntries: (entries: DirectoryEntry[]) => void;
  setPage: (page: number) => void;
  setBrowsingFastDirectory: (value: boolean) => void;
}

export const FileManagerContext = createContext<FileManagerContextType | undefined>(undefined);

export const useFileManager = () => {
  const context = useContext(FileManagerContext);
  if (!context) {
    throw new Error('useFileManager must be used within a FileManagerProvider');
  }
  return context;
};

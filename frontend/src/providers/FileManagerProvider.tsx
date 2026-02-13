import { ReactNode, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { FileManagerContext } from '@/providers/contexts/fileManagerContext.ts';

const FileManagerProvider = ({ children }: { children: ReactNode }) => {
  const [searchParams, _] = useSearchParams();

  const [selectedFileNames, setSelectedFileNames] = useState(new Set<string>());
  const [browsingDirectory, setBrowsingDirectory] = useState('');
  const [browsingEntries, setBrowsingEntries] = useState<DirectoryEntry[]>([]);
  const [page, setPage] = useState(1);
  const [browsingFastDirectory, setBrowsingFastDirectory] = useState(true);

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
        setSelectedFiles,
        addSelectedFile,
        removeSelectedFile,
        setBrowsingDirectory,
        setBrowsingEntries,
        setPage,
        setBrowsingFastDirectory,
      }}
    >
      {children}
    </FileManagerContext.Provider>
  );
};

export { FileManagerProvider };
export { useFileManager } from './contexts/fileManagerContext.ts';

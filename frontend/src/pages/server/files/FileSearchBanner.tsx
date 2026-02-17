import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert } from '@mantine/core';
import { bytesToString } from '@/lib/size.ts';
import { useFileManager } from '@/providers/contexts/fileManagerContext.ts';

export default function FileSearchBanner() {
  const { browsingEntries, searchInfo, setSearchInfo, invalidateFilemanager } = useFileManager();

  const closeSearch = async () => {
    setSearchInfo(null);
    invalidateFilemanager();
  };

  if (!searchInfo) return null;

  return (
    <Alert
      icon={<FontAwesomeIcon icon={faSearch} />}
      color='blue'
      title={`Search Results (${browsingEntries.total} files found)`}
      onClose={closeSearch}
      withCloseButton
      mb='md'
    >
      {(searchInfo.query ||
        searchInfo.filters.contentFilter ||
        searchInfo.filters.sizeFilter ||
        (searchInfo.filters.pathFilter?.exclude && searchInfo.filters.pathFilter.exclude.length > 0)) && (
        <div className='flex flex-col gap-1 text-sm'>
          {searchInfo.query && (
            <div>
              <span className='font-medium text-white/80'>Query:</span>{' '}
              <span className='text-white/60'>&quot;{searchInfo.query}&quot;</span>
            </div>
          )}
          {searchInfo.filters.pathFilter?.exclude && searchInfo.filters.pathFilter.exclude.length > 0 && (
            <div>
              <span className='font-medium text-white/80'>Excluded:</span>{' '}
              <span className='text-white/60'>{searchInfo.filters.pathFilter.exclude.join(', ')}</span>
            </div>
          )}
          {searchInfo.filters.contentFilter && (
            <div>
              <span className='font-medium text-white/80'>Content:</span>{' '}
              <span className='text-white/60'>{searchInfo.filters.contentFilter.query || '(empty)'}</span>
            </div>
          )}
          {searchInfo.filters.sizeFilter && (
            <div>
              <span className='font-medium text-white/80'>Size:</span>{' '}
              <span className='text-white/60'>
                {searchInfo.filters.sizeFilter.min > 0 && (
                  <span>Min: {bytesToString(searchInfo.filters.sizeFilter.min)}</span>
                )}
                {searchInfo.filters.sizeFilter.min > 0 && searchInfo.filters.sizeFilter.max > 0 && ', '}
                {searchInfo.filters.sizeFilter.max > 0 && (
                  <span>Max: {bytesToString(searchInfo.filters.sizeFilter.max)}</span>
                )}
              </span>
            </div>
          )}
        </div>
      )}
    </Alert>
  );
}

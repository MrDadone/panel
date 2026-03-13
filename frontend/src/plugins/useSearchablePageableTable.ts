import debounce from 'debounce';
import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { httpErrorToHuman } from '@/api/axios.ts';
import { useToast } from '@/providers/ToastProvider.tsx';

interface UseSearchablePaginatedTableOptions<T> {
  fetcher: (page: number, search: string) => Promise<T>;
  setStoreData: (data: T) => void;
  paginationKey?: string;
  deps?: unknown[];
  debounceMs?: number;
  initialPage?: number;
  modifyParams?: boolean;
}

function parseNumber(num: string | null): number | null {
  if (!num) return null;

  const parsed = parseInt(num);

  return Number.isFinite(parsed) && parsed >= 1 ? parsed : null;
}

export function useSearchablePaginatedTable<T>({
  fetcher,
  setStoreData,
  paginationKey,
  deps = [],
  debounceMs = 150,
  initialPage = 1,
  modifyParams = true,
}: UseSearchablePaginatedTableOptions<T>) {
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(modifyParams ? searchParams.get('search') || '' : '');
  const [page, setPage] = useState(modifyParams ? (parseNumber(searchParams.get('page')) ?? initialPage) : initialPage);

  useEffect(() => {
    if (modifyParams) {
      setSearchParams({ page: page.toString(), search });
    }
  }, [modifyParams, page, search]);

  const fetchData = useCallback(
    (p: number, s: string) => {
      setLoading(true);
      fetcher(p, s)
        .then((res) => {
          const paginationData = paginationKey
            ? res && typeof res === 'object' && paginationKey in res
              ? res[paginationKey as never]
              : res
            : res;

          if (
            paginationData &&
            typeof paginationData === 'object' &&
            'total' in paginationData &&
            typeof paginationData.total === 'number' &&
            'perPage' in paginationData &&
            typeof paginationData.perPage === 'number' &&
            'page' in paginationData &&
            typeof paginationData.page === 'number'
          ) {
            const totalPages = Math.ceil(paginationData.total / paginationData.perPage);

            if (paginationData.total === 0 && paginationData.page !== 1) {
              setPage(1);
            } else if (p > totalPages && totalPages !== 0) {
              setPage(totalPages);
            } else {
              setStoreData(res);
            }
          }
        })
        .catch((err) => {
          addToast(httpErrorToHuman(err), 'error');
        })
        .finally(() => setLoading(false));
    },
    [addToast, setStoreData, setPage, ...deps],
  );

  const debouncedSearch = useCallback(
    debounce((search: string) => fetchData(page, search), debounceMs),
    [page, fetchData],
  );

  useEffect(() => {
    if (search) {
      debouncedSearch(search);
    } else {
      debouncedSearch.clear();
      fetchData(page, '');
    }
  }, [page, search, debouncedSearch]);

  return {
    loading,
    search,
    setSearch,
    page,
    setPage,
    refetch: () => fetchData(page, search),
  };
}

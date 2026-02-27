import debounce from 'debounce';
import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { httpErrorToHuman } from '@/api/axios.ts';
import { useToast } from '@/providers/ToastProvider.tsx';

interface UseSearchablePaginatedTableOptions<T> {
  fetcher: (page: number, search: string) => Promise<Pagination<T>>;
  setStoreData: (data: Pagination<T>) => void;
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
          const totalPages = Math.ceil(res.total / res.perPage);

          if (res.total === 0 && res.page !== 1) {
            setPage(1);
          } else if (p > totalPages && totalPages !== 0) {
            setPage(totalPages);
          } else {
            setStoreData(res);
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

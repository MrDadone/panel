import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router';
import debounce from 'debounce';
import { httpErrorToHuman } from '@/api/axios';
import { useToast } from '@/providers/ToastProvider';
import { load } from '@/lib/debounce';

interface UseSearchablePaginatedTableOptions<T> {
  fetcher: (page: number, search: string) => Promise<ResponseMeta<T>>;
  setStoreData: (data: ResponseMeta<T>) => void;
  deps?: unknown[];
  debounceMs?: number;
  initialPage?: number;
}

export function useSearchablePaginatedTable<T>({
  fetcher,
  setStoreData,
  deps = [],
  debounceMs = 150,
  initialPage = 1,
}: UseSearchablePaginatedTableOptions<T>) {
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(initialPage);

  useEffect(() => {
    const urlPage = Number(searchParams.get('page')) || initialPage;
    const urlSearch = searchParams.get('search') || '';
    setPage(urlPage);
    setSearch(urlSearch);
  }, []);

  useEffect(() => {
    setSearchParams({ page: page.toString(), search });
  }, [page, search]);

  const fetchData = useCallback(
    (p: number, s: string) => {
      setLoading(true);
      fetcher(p, s)
        .then((res) => {
          setStoreData(res);
        })
        .catch((err) => {
          addToast(httpErrorToHuman(err), 'error');
        })
        .finally(() => load(false, setLoading));
    },
    [addToast, setStoreData, ...deps],
  );

  const debouncedSearch = useCallback(
    debounce((search: string) => fetchData(page, search), debounceMs),
    [page, fetchData],
  );

  useEffect(() => {
    if (search) {
      debouncedSearch(search);
    } else {
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

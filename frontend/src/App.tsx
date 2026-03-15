import { MantineProvider, type MantineThemeOverride } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createBrowserHistory } from 'history';
import { useEffect } from 'react';
import { unstable_HistoryRouter as HistoryRouter } from 'react-router';
import getLanguages from './api/getLanguages.ts';
import getSettings from './api/getSettings.ts';
import ErrorBoundary from './elements/ErrorBoundary.tsx';
import Spinner from './elements/Spinner.tsx';
import { CurrentWindowProvider } from './providers/CurrentWindowProvider.tsx';
import { HistoryContext } from './providers/contexts/historyContext.ts';
import { ToastProvider } from './providers/ToastProvider.tsx';
import { WindowProvider } from './providers/WindowProvider.tsx';
import RouterRoutes from './RouterRoutes.tsx';
import { useGlobalStore } from './stores/global.ts';

import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import TranslationProvider from './providers/TranslationProvider.tsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const browserHistory = createBrowserHistory();

export default function App({ theme }: { theme: MantineThemeOverride }) {
  const { settings, setSettings, setLanguages } = useGlobalStore();

  useEffect(() => {
    Promise.all([getSettings(), getLanguages()]).then(([settings, languages]) => {
      setSettings(settings);
      setLanguages(languages);
    });
  }, []);

  return Object.keys(settings).length > 0 ? (
    <ErrorBoundary>
      <MantineProvider theme={theme} forceColorScheme='dark'>
        <QueryClientProvider client={queryClient}>
          <TranslationProvider>
            <ToastProvider>
              <WindowProvider>
                <CurrentWindowProvider id={null}>
                  <HistoryContext.Provider value={browserHistory}>
                    <HistoryRouter history={browserHistory as never}>
                      <RouterRoutes isNormal />
                    </HistoryRouter>
                  </HistoryContext.Provider>

                  <ReactQueryDevtools initialIsOpen={false} />
                </CurrentWindowProvider>
              </WindowProvider>
            </ToastProvider>
          </TranslationProvider>
        </QueryClientProvider>
      </MantineProvider>
    </ErrorBoundary>
  ) : (
    <Spinner.Centered />
  );
}

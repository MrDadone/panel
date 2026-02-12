import { MantineProvider } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useEffect } from 'react';
import { BrowserRouter } from 'react-router';
import getLanguages from './api/getLanguages.ts';
import getSettings from './api/getSettings.ts';
import ErrorBoundary from './elements/ErrorBoundary.tsx';
import Spinner from './elements/Spinner.tsx';
import { CurrentWindowProvider } from './providers/CurrentWindowProvider.tsx';
import { ToastProvider } from './providers/ToastProvider.tsx';
import { WindowProvider } from './providers/WindowProvider.tsx';
import RouterRoutes from './RouterRoutes.tsx';
import { useGlobalStore } from './stores/global.ts';

import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App() {
  const { settings, setSettings, setLanguages } = useGlobalStore();

  useEffect(() => {
    Promise.all([getSettings(), getLanguages()]).then(([settings, languages]) => {
      setSettings(settings);
      setLanguages(languages);
    });
  }, []);

  return Object.keys(settings).length > 0 ? (
    <ErrorBoundary>
      <MantineProvider forceColorScheme='dark'>
        <QueryClientProvider client={queryClient}>
          <ToastProvider>
            <WindowProvider>
              <CurrentWindowProvider id={null}>
                <BrowserRouter>
                  <RouterRoutes isNormal />
                </BrowserRouter>

                <ReactQueryDevtools initialIsOpen={false} />
              </CurrentWindowProvider>
            </WindowProvider>
          </ToastProvider>
        </QueryClientProvider>
      </MantineProvider>
    </ErrorBoundary>
  ) : (
    <Spinner.Centered />
  );
}

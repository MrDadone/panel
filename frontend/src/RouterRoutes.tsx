import { Suspense, useEffect } from 'react';
import { Route, Routes } from 'react-router';
import Spinner from './elements/Spinner.tsx';
import AuthProvider from './providers/AuthProvider.tsx';
import AdminGuard from './routers/guards/AdminGuard.tsx';
import AuthenticatedGuard from './routers/guards/AuthenticatedGuard.tsx';
import UnauthenticatedGuard from './routers/guards/UnauthenticatedGuard.tsx';
import '@mantine/core/styles.css';
import { lazy } from 'react';
import OobeGuard from '@/routers/guards/OobeGuard.tsx';
import NotFound from './pages/NotFound.tsx';
import { useCurrentWindow } from './providers/CurrentWindowProvider.tsx';
import TranslationProvider from './providers/TranslationProvider.tsx';
import { useWindows } from './providers/WindowProvider.tsx';
import globalRoutes from './routers/routes/globalRoutes.ts';
import { AdminStoreContextProvider, createAdminStore } from './stores/admin.tsx';
import {
  createRelativePageStore,
  RelativePageStoreContextProvider,
  useRelativePageStore,
} from './stores/relativePage.ts';
import { createServerStore, ServerStoreContextProvider } from './stores/server.ts';

const OobeRouter = lazy(() => import('./routers/OobeRouter.tsx'));
const AuthenticationRouter = lazy(() => import('./routers/AuthenticationRouter.tsx'));
const DashboardRouter = lazy(() => import('./routers/DashboardRouter.tsx'));
const AdminRouter = lazy(() => import('./routers/AdminRouter.tsx'));
const ServerRouter = lazy(() => import('./routers/ServerRouter.tsx'));

function RelativePageListener() {
  const { updateWindow } = useWindows();
  const { title } = useRelativePageStore();
  const { id } = useCurrentWindow();

  useEffect(() => {
    if (id) {
      updateWindow(id, title);
    } else {
      document.title = title;
    }
  }, [id, title]);

  return null;
}

export default function RouterRoutes({ isNormal }: { isNormal: boolean }) {
  return (
    <TranslationProvider>
      <RelativePageStoreContextProvider createStore={createRelativePageStore}>
        <AdminStoreContextProvider createStore={createAdminStore}>
          <ServerStoreContextProvider createStore={createServerStore}>
            <AuthProvider>
              {window.extensionContext.extensionRegistry.pages.global.prependedComponents.map((Component, index) => (
                <Component key={`global-prepended-${index}`} />
              ))}

              <Suspense fallback={<Spinner.Centered />}>
                <Routes>
                  {globalRoutes
                    .filter((route) => !route.filter || route.filter())
                    .map(({ path, element: Element }) => (
                      <Route key={path} path={path} element={<Element />} />
                    ))}
                  {window.extensionContext.extensionRegistry.routes.globalRoutes
                    .filter((route) => !route.filter || route.filter())
                    .map(({ path, element: Element }) => (
                      <Route key={path} path={path} element={<Element />} />
                    ))}

                  <Route element={<OobeGuard />}>
                    <Route path='/oobe/*' element={<OobeRouter />} />

                    <Route element={<UnauthenticatedGuard />}>
                      <Route path='/auth/*' element={<AuthenticationRouter />} />
                    </Route>

                    <Route element={<AuthenticatedGuard />}>
                      <Route path='/server/:id/*' element={<ServerRouter isNormal={isNormal} />} />
                      <Route path='/*' element={<DashboardRouter isNormal={isNormal} />} />

                      <Route element={<AdminGuard />}>
                        <Route path='/admin/*' element={<AdminRouter isNormal={isNormal} />} />
                      </Route>
                    </Route>

                    <Route path='*' element={<NotFound />} />
                  </Route>
                </Routes>
              </Suspense>

              {window.extensionContext.extensionRegistry.pages.global.appendedComponents.map((Component, index) => (
                <Component key={`global-appended-${index}`} />
              ))}
              <RelativePageListener />
            </AuthProvider>
          </ServerStoreContextProvider>
        </AdminStoreContextProvider>
      </RelativePageStoreContextProvider>
    </TranslationProvider>
  );
}

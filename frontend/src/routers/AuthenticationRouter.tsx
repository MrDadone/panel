import { Route, Routes } from 'react-router';
import ContentContainer from '@/elements/containers/ContentContainer.tsx';
import ScreenBlock from '@/elements/ScreenBlock.tsx';
import authenticationRoutes from '@/routers/routes/authenticationRoutes.ts';

export default function AuthenticationRouter() {
  return (
    <Routes>
      {[...authenticationRoutes, ...window.extensionContext.extensionRegistry.routes.authenticationRoutes]
        .filter((route) => !route.filter || route.filter())
        .map(({ path, element: Element }) => (
          <Route key={path} path={path} element={<Element />} />
        ))}
      <Route
        path='*'
        element={
          <ContentContainer title='Not found'>
            <ScreenBlock title='404' content='Page not found' />
          </ContentContainer>
        }
      />
    </Routes>
  );
}

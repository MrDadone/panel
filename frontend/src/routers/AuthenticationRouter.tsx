import { Route, Routes } from 'react-router';
import NotFound from '@/pages/NotFound.tsx';
import authenticationRoutes from '@/routers/routes/authenticationRoutes.ts';

export default function AuthenticationRouter() {
  return (
    <Routes>
      {[...authenticationRoutes, ...window.extensionContext.extensionRegistry.routes.authenticationRoutes]
        .filter((route) => !route.filter || route.filter())
        .map(({ path, element: Element }) => (
          <Route key={path} path={path} element={<Element />} />
        ))}
      <Route path='*' element={<NotFound />} />
    </Routes>
  );
}

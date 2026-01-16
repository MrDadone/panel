import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Tabs } from '@mantine/core';
import { ReactNode } from 'react';
import { NavLink, Route, Routes, useLocation } from 'react-router';
import { to } from '@/lib/routes.ts';
import { useAdminPermissions, useCan } from '@/plugins/usePermissions.ts';
import AdminPermissionGuard from '@/routers/guards/AdminPermissionGuard.tsx';

interface BaseItemProp {
  name: string;
  icon: IconDefinition;
  permission?: string;
  end?: boolean;
}

interface RouteItem extends BaseItemProp {
  path: string;
  element: ReactNode;
  link?: never;
}

interface LinkItem extends BaseItemProp {
  link: string;
  path?: never;
  element?: never;
}

export type ItemProp = RouteItem | LinkItem;

interface Props {
  baseUrl: string;
  items: ItemProp[];
}

function SubNavigationItem({ baseUrl, item }: { baseUrl: string; item: ItemProp }) {
  const permissionMatrix = useAdminPermissions(item.permission ?? []);
  const canAccess = useCan(permissionMatrix, true);

  if (item.permission && !canAccess) return null;

  return (
    <NavLink key={item.name} to={item.link ?? to(item.path, baseUrl)} end={item.end ?? true}>
      <Tabs.Tab key={item.name} value={item.name} leftSection={<FontAwesomeIcon icon={item.icon} />}>
        {item.name}
      </Tabs.Tab>
    </NavLink>
  );
}

export default function SubNavigation({ baseUrl, items }: Props) {
  const location = useLocation();
  const activeItem =
    items
      .filter((item) => {
        if (item.path) return location.pathname.endsWith(item.path);
        if (item.link) return item.link === '/' ? location.pathname === '/' : location.pathname.endsWith(item.link);
        return false;
      })
      .sort((a, b) => (b.path?.length ?? b.link?.length ?? 0) - (a.path?.length ?? a.link?.length ?? 0))[0] ?? items[0];

  return (
    <>
      <Tabs my='xs' value={activeItem?.name ?? items[0].name}>
        <Tabs.List>
          {items.map((item) => (
            <SubNavigationItem key={item.name} baseUrl={baseUrl} item={item} />
          ))}
        </Tabs.List>
      </Tabs>
      <Routes>
        {items
          .filter((item) => item.path)
          .map((item) => (
            <Route key={item.path} element={<AdminPermissionGuard permission={item.permission ?? []} />}>
              <Route path={item.path} element={item.element} />
            </Route>
          ))}
      </Routes>
    </>
  );
}

export const isAdmin = (user: FullUser | null) => {
  return user?.admin || (user?.role?.adminPermissions || []).length > 0;
};

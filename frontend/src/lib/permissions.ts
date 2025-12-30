export const isAdmin = (user: User) => {
  return user?.admin || (user?.role?.adminPermissions || []).length > 0;
};

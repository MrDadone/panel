export const isAdmin = (user: User | null) => {
  return user?.admin || (user?.role?.adminPermissions || []).length > 0;
};

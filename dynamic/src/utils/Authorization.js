export const ADMIN_ROLES = [
  "ADMIN",
  "MEMBER_USER",
];

export const isAdmin = (user) => {
  return ADMIN_ROLES.includes(user?.role);
};

// lib/roles.ts

import { Role } from "@prisma/client";

export const PermissionGate = (roles: Role[] | undefined, allowed: Role[]): boolean => {
  if (!roles) return false;
  return allowed.some(role => roles.includes(role));
};

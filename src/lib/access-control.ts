import type { SafeUser, UserRole } from "@/lib/types";

const portalAdminAssignableRoles: UserRole[] = [
  "portal_admin",
  "admin",
  "portfolio_manager",
  "editor",
];

const adminAssignableRoles: UserRole[] = [
  "admin",
  "portfolio_manager",
  "editor",
];

export function isPortfolioRole(role: string): boolean {
  return role === "portfolio_manager" || role === "advisor";
}

export function canAccessOverview(role: string): boolean {
  return role === "portal_admin" || role === "admin";
}

export function canManageUsers(role: string): boolean {
  return role === "portal_admin" || role === "admin";
}

export function canManageAdvisors(role: string): boolean {
  return role === "portal_admin" || role === "admin";
}

export function canManageBlogs(role: string): boolean {
  return role === "portal_admin" || role === "admin" || role === "editor";
}

export function canCreateOrEditPortfolios(role: string): boolean {
  return role === "portal_admin" || role === "admin" || isPortfolioRole(role);
}

export function canDeletePortfolios(role: string): boolean {
  return role === "portal_admin" || role === "admin";
}

export function canManageLeads(role: string): boolean {
  return role === "portal_admin" || role === "admin";
}

export function assignableUserRoles(actorRole: string): UserRole[] {
  if (actorRole === "portal_admin") {
    return portalAdminAssignableRoles;
  }

  if (actorRole === "admin") {
    return adminAssignableRoles;
  }

  return [];
}

export function canAssignUserRole(actorRole: string, targetRole: string): boolean {
  return assignableUserRoles(actorRole).includes(targetRole as UserRole);
}

export function canViewManagedUser(
  actor: Pick<SafeUser, "id" | "role">,
  target: Pick<SafeUser, "id" | "role">,
): boolean {
  if (actor.role === "portal_admin") {
    return true;
  }

  if (actor.role === "admin") {
    return target.role !== "portal_admin";
  }

  return actor.id === target.id;
}

export function canDeleteManagedUser(
  actor: Pick<SafeUser, "id" | "role">,
  target: Pick<SafeUser, "id" | "role">,
): boolean {
  if (!canManageUsers(actor.role) || actor.id === target.id) {
    return false;
  }

  if (actor.role === "portal_admin") {
    return true;
  }

  if (actor.role === "admin") {
    return target.role !== "portal_admin";
  }

  return false;
}

export function filterUsersForActor(actor: Pick<SafeUser, "id" | "role">, users: SafeUser[]): SafeUser[] {
  return users.filter((user) => canViewManagedUser(actor, user));
}

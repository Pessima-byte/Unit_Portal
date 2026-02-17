import { UserRole } from "@prisma/client"

export function hasPermission(userRole: UserRole, requiredRole: UserRole | UserRole[]): boolean {
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(userRole)
  }
  return userRole === requiredRole
}

export function isAdmin(userRole: UserRole): boolean {
  return userRole === UserRole.ADMIN
}

export function isLecturer(userRole: UserRole): boolean {
  return userRole === UserRole.LECTURER
}

export function isStudent(userRole: UserRole): boolean {
  return userRole === UserRole.STUDENT
}

export function isFinance(userRole: UserRole): boolean {
  return userRole === UserRole.FINANCE
}





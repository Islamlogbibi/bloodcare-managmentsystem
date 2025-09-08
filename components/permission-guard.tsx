"use client"

import type { ReactNode } from "react"
import { useAuth } from "@/hooks/use-auth"
import type { UserRole } from "@/lib/auth"

interface PermissionGuardProps {
  children: ReactNode
  permission?: keyof ReturnType<typeof useAuth>["hasPermission"] extends (arg: infer P) => boolean ? P : never
  role?: UserRole
  fallback?: ReactNode
  requireAll?: boolean
}

export function PermissionGuard({
  children,
  permission,
  role,
  fallback = null,
  requireAll = false,
}: PermissionGuardProps) {
  const { user, hasPermission, hasRole, isLoading } = useAuth()

  if (isLoading) {
    return <div className="animate-pulse bg-muted h-8 rounded" />
  }

  if (!user) {
    return <>{fallback}</>
  }

  let hasAccess = true

  if (permission && role) {
    if (requireAll) {
      hasAccess = hasPermission(permission) && hasRole(role)
    } else {
      hasAccess = hasPermission(permission) || hasRole(role)
    }
  } else if (permission) {
    hasAccess = hasPermission(permission)
  } else if (role) {
    hasAccess = hasRole(role)
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>
}

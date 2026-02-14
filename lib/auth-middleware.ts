import { type NextRequest, NextResponse } from "next/server"
import { getSession, type UserRole } from "@/lib/auth"

export async function withAuth(
  request: NextRequest,
  handler: (request: NextRequest, user: any) => Promise<NextResponse>,
  options?: {
    requiredRole?: UserRole
    requiredPermission?: string
  },
) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // Check role requirement
    if (options?.requiredRole) {
      const roleHierarchy = { admin: 3, doctor: 2, assistant: 1 }
      const userLevel = roleHierarchy[session.role]
      const requiredLevel = roleHierarchy[options.requiredRole]

      if (userLevel < requiredLevel) {
        return NextResponse.json({ error: "Permissions insuffisantes" }, { status: 403 })
      }
    }

    return await handler(request, session)
  } catch (error) {
    console.error("Auth middleware error:", error)
    return NextResponse.json({ error: "Erreur d'authentification" }, { status: 500 })
  }
}

export function requirePermission(permission: string) {
  return (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const session = await getSession()
      if (!session) {
        throw new Error("Non autorisé")
      }

      // Add permission check logic here based on your permission system
      const hasPermission = checkUserPermission(session.role, permission)
      if (!hasPermission) {
        throw new Error("Permissions insuffisantes")
      }

      return method.apply(this, args)
    }
  }
}

function checkUserPermission(role: UserRole, permission: string): boolean {
  const permissions = {
    admin: ["*"], // Admin has all permissions
    doctor: ["view_analytics", "manage_patients", "schedule_transfusions", "view_reports", "export_data"],
    assistant: ["manage_patients", "schedule_transfusions"],
  }

  const userPermissions = permissions[role] || []
  return userPermissions.includes("*") || userPermissions.includes(permission)
}

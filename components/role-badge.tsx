"use client"

import { Badge } from "@/components/ui/badge"
import type { UserRole } from "@/lib/auth"
import { Shield, Stethoscope, UserCheck } from "lucide-react"

interface RoleBadgeProps {
  role: UserRole
  showIcon?: boolean
}

export function RoleBadge({ role, showIcon = true }: RoleBadgeProps) {
  const roleConfig: Record<UserRole, { label: string; variant: "default" | "secondary" | "destructive"; icon: any }> = {
    admin: {
      label: "Administrateur",
      variant: "destructive",
      icon: Shield,
    },
    doctor: {
      label: "Médecin",
      variant: "default",
      icon: Stethoscope,
    },
    assistant: {
      label: "Assistant",
      variant: "secondary",
      icon: UserCheck,
    },
  }

  const config = roleConfig[role]

  if (!config) {
    return (
      <Badge variant="secondary" className="flex items-center gap-1">
        {role || "Unknown"}
      </Badge>
    )
  }

  const Icon = config.icon

  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      {showIcon && <Icon className="w-3 h-3" />}
      {config.label}
    </Badge>
  )
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  description: string
  trend?: string
  variant?: "default" | "success" | "warning" | "destructive"
}

export function StatsCard({ title, value, icon: Icon, description, trend, variant = "default" }: StatsCardProps) {
  const variantStyles = {
    default: "border-gray-200 bg-white",
    success: "border-green-200 bg-green-50",
    warning: "border-yellow-200 bg-yellow-50",
    destructive: "border-red-200 bg-red-50",
  }

  const iconStyles = {
    default: "text-gray-600",
    success: "text-green-600",
    warning: "text-yellow-600",
    destructive: "text-red-600",
  }

  const trendStyles = {
    default: "bg-gray-100 text-gray-700",
    success: "bg-green-100 text-green-700",
    warning: "bg-yellow-100 text-yellow-700",
    destructive: "bg-red-100 text-red-700",
  }

  return (
    <Card className={cn("border-0 shadow-md", variantStyles[variant])}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-700">{title}</CardTitle>
        <Icon className={cn("h-5 w-5", iconStyles[variant])} />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
        <p className="text-xs text-gray-600 mb-2">{description}</p>
        {trend && (
          <Badge variant="secondary" className={cn("text-xs", trendStyles[variant])}>
            {trend}
          </Badge>
        )}
      </CardContent>
    </Card>
  )
}

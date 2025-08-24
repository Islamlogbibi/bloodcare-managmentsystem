"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { toast } from "@/hooks/use-toast"

export function AnalyticsPageActions() {
  const { t } = useLanguage()

  const handleExportAnalytics = async () => {
    try {
      const response = await fetch("/api/stats/export")

      if (!response.ok) {
        throw new Error("Failed to export analytics")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `analytics-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: t("exportSuccess") || "Export Successful",
        description: t("analyticsExportedSuccessfully") || "Analytics exported successfully",
      })
    } catch (error) {
      console.error("Export error:", error)
      toast({
        title: t("exportError") || "Export Error",
        description: t("failedToExportAnalytics") || "Failed to export analytics",
        variant: "destructive",
      })
    }
  }

  return (
    <Button variant="outline" className="border-gray-300" onClick={handleExportAnalytics}>
      <Download className="mr-2 h-4 w-4" />
      {t("exportAnalytics") || "Export Analytics"}
    </Button>
  )
}

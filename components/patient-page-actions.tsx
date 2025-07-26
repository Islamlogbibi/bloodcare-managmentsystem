"use client"

import { Button } from "@/components/ui/button"
import { Printer, Download } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { toast } from "@/hooks/use-toast"

interface PatientPageActionsProps {
  searchParams: {
    search?: string
    category?: string
    bloodType?: string
    ph?: string
  }
}

export function PatientPageActions({ searchParams }: PatientPageActionsProps) {
  const { t } = useLanguage()

  const handlePrint = () => {
    window.print()
  }

  const handleExport = async () => {
    try {
      // Build filters from search params
      const filters: any = {}

      if (searchParams.search) {
        filters.search = searchParams.search
      }

      if (searchParams.category && searchParams.category !== "All Patients") {
        filters.patientCategory = searchParams.category
      }

      if (searchParams.bloodType && searchParams.bloodType !== "all") {
        filters.bloodType = searchParams.bloodType
      }

      if (searchParams.ph && searchParams.ph !== "all") {
        filters.ph = searchParams.ph
      }

      // Fetch patients with filters
      const response = await fetch(`/api/patients/export?${new URLSearchParams(filters).toString()}`)

      if (!response.ok) {
        throw new Error("Failed to export patients")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `patients-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: t("exportSuccess") || "Export Successful",
        description: t("patientsExportedSuccessfully") || "Patients exported successfully",
      })
    } catch (error) {
      console.error("Export error:", error)
      toast({
        title: t("exportError") || "Export Error",
        description: t("failedToExportPatients") || "Failed to export patients",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <Button variant="outline" className="border-gray-300" onClick={handleExport}>
        <Download className="mr-2 h-4 w-4" />
        {t("export") || "Export"}
      </Button>
      <Button variant="outline" className="border-gray-300" onClick={handlePrint}>
        <Printer className="mr-2 h-4 w-4" />
        {t("printList") || "Print List"}
      </Button>
    </>
  )
}

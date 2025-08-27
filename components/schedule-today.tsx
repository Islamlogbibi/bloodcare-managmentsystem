"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { toast } from "@/hooks/use-toast"
import { scheduleTransfusion } from "@/app/lib/actions"
import { useRouter } from "next/navigation"

interface QuickScheduleDialogProps {
  patient: any
  children: React.ReactNode
}

export function Schedule({ patient, children }: QuickScheduleDialogProps) {
  const { t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [isScheduling, setIsScheduling] = useState(false)
  const router = useRouter()

  const handleSchedule = async (priority: "regular" | "today") => {
    setIsScheduling(true)

    try {
      const today = new Date()
      const scheduledDate = priority === "today" ? today : new Date(today.getTime() + 24 * 60 * 60 * 1000)
      const scheduledTime = priority === "today" ? "14:00" : "09:00"
      priority = "regular"
      await scheduleTransfusion({
        patientId: patient._id,
        scheduledDate: scheduledDate.toISOString(),
        scheduledTime,
        priority,
        bloodUnits: 2,
        notes: `Quick scheduled as ${priority} case for ${patient.firstName} ${patient.lastName}`,
      })

      const scheduledTimeText = "demain à 9h00"

      toast({
        title: t("scheduleTransfusion"),
        description: `${patient.firstName} ${patient.lastName} programmé pour ${scheduledTimeText}`,
      })

      setIsOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Scheduling error:", error)
      toast({
        title: t("error"),
        description: "Échec de la programmation de la transfusion. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setIsScheduling(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            {t("scheduleTransfusion")}
          </DialogTitle>
          <DialogDescription>
            Planifier une transfusion sanguine pour {patient.firstName} {patient.lastName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Patient :</span>
              <span>
                {patient.firstName} {patient.lastName}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Groupe Sanguin :</span>
              <Badge variant="outline" className="border-red-200 text-red-700">
                {patient.bloodType}
              </Badge>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Sélectionner la Priorité :</h4>

            <Button
              variant="outline"
              className="w-full justify-start h-auto p-4 border-blue-200 hover:bg-blue-50 bg-transparent"
              onClick={() => handleSchedule("regular")}
              disabled={isScheduling}
            >
              <div className="flex items-center gap-3">
                <div className="text-left">
                  <div className="font-medium">{t("tomorrow")}</div>
                  <div className="text-sm text-gray-500">Demain</div>
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start h-auto p-4 border-red-200 hover:bg-red-50 bg-transparent"
              onClick={() => handleSchedule("today")}
              disabled={isScheduling}
            >
              <div className="flex items-center gap-3">
                <div className="text-left">
                  <div className="font-medium">{t("today")}</div>
                  <div className="text-sm text-gray-500">Aujourd'hui</div>
                </div>
              </div>
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isScheduling}>
            {t("cancel")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

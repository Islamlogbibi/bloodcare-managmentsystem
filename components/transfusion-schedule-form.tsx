"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Save } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { scheduleTransfusion } from "@/app/lib/actions"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

interface TransfusionScheduleFormProps {
  patient: any
}

export function TransfusionScheduleForm({ patient }: TransfusionScheduleFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined)

  async function onSubmit(formData: FormData) {
    setIsLoading(true)

    try {
      const scheduledTime = formData.get("scheduledTime") as string
      const [hours, minutes] = scheduledTime.split(":")

      const combinedDateTime = new Date(scheduledDate!)
      combinedDateTime.setHours(Number.parseInt(hours), Number.parseInt(minutes))

      const transfusionData = {
        patientId: patient._id,
        scheduledDate: scheduledDate?.toISOString(),
        scheduledTime: combinedDateTime.toISOString(),
        priority: formData.get("priority") as string,
        bloodUnits: Number.parseInt(formData.get("bloodUnits") as string),
        notes: formData.get("notes") as string,
      }

      await scheduleTransfusion(transfusionData)
      toast({
        title: "Transfusion Planifiée",
        description: "La transfusion a été planifiée avec succès.",
      })

      router.push("/transfusions/today")
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form action={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Patient</Label>
          <Input value={`${patient.firstName} ${patient.lastName}`} disabled />
        </div>
        <div className="space-y-2">
          <Label>Groupe Sanguin</Label>
          <Input value={patient.bloodType} disabled />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Date Prévue *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !scheduledDate && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {scheduledDate ? format(scheduledDate, "PPP") : "Sélectionner une date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={scheduledDate}
                onSelect={setScheduledDate}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <Label htmlFor="scheduledTime">Heure Prévue *</Label>
          <Input id="scheduledTime" name="scheduledTime" type="time" required />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="priority">Priorité *</Label>
          <Select name="priority" defaultValue="regular">
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner la priorité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="regular">Normale</SelectItem>
              <SelectItem value="urgent">Urgente</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="bloodUnits">Unités de Sang *</Label>
          <Input id="bloodUnits" name="bloodUnits" type="number" min="1" max="10" defaultValue="1" required />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={4}
          placeholder="Entrez toute instruction spéciale ou note concernant la transfusion..."
        />
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Annuler
        </Button>
        <Button type="submit" disabled={isLoading || !scheduledDate} className="bg-red-600 hover:bg-red-700">
          <Save className="mr-2 h-4 w-4" />
          {isLoading ? "Planification..." : "Planifier la Transfusion"}
        </Button>
      </div>
    </form>
  )
}
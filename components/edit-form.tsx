"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

import { Label } from "@/components/ui/label"

import { Save, Heart } from "lucide-react"

import { createPatient, updatePatient } from "@/app/lib/actions"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface PatientFormProps {
  patient?: any
  isEditing?: boolean
}

export function PatientForm({ patient, isEditing = false }: PatientFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [Hdist, setHdist] = useState<string | undefined>(patient?.Hdist ?? undefined)

  const [Hrecu, setHrecu] = useState<string | undefined>(patient?.Hrecu ?? undefined)


  async function onSubmit(formData: FormData) {
    setIsLoading(true)

    try {
      const patientData = {
        
        Hdist: Hdist,
        Hrecu: Hrecu,
        
      }

      if (isEditing && patient) {
        await updatePatient(patient._id, patientData)
        toast({
          title: "Patient Updated",
          description: "Patient information has been successfully updated.",
        })
      } else {
        await createPatient(patientData)
        toast({
          title: "Patient Registered",
          description: "New patient has been successfully registered.",
        })
      }

      router.push("/patients")
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form action={onSubmit} className="space-y-8">
      
      {/* Medical Information */}
      <Card className="border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-gray-900">
            <Heart className="mr-2 h-5 w-5 text-red-600" />
            Medical Information
          </CardTitle>
          <CardDescription>Blood type and medical details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">H.dist (Time)</Label>
                <input
                    type="time"
                    value={Hdist ?? ""}
                    onChange={(e) => setHdist(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm"
                />
            </div>

            <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">H.recu (Time)</Label>
                <input
                    type="time"
                    value={Hrecu ?? ""}
                    onChange={(e) => setHrecu(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm"
                />
            </div>
          </div>

        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4 pt-6">
        <Button type="button" variant="outline" onClick={() => router.back()} className="border-gray-300">
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="bg-red-600 hover:bg-red-700">
          <Save className="mr-2 h-4 w-4" />
          {isLoading ? "Saving..." : isEditing ? "Update Patient" : "Register Patient"}
        </Button>
      </div>
    </form>
  )
}

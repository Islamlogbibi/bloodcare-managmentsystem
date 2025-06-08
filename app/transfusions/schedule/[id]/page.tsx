import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TransfusionScheduleForm } from "@/components/transfusion-schedule-form"
import { getPatientById } from "@/app/lib/actions"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface ScheduleTransfusionPageProps {
  params: Promise<{ id: string }>
}

export default async function ScheduleTransfusionPage({ params }: ScheduleTransfusionPageProps) {
  const { id } = await params
  const patient = await getPatientById(id)

  if (!patient) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center space-x-4">
          <Link href="/patients">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Patients
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Schedule Transfusion</h1>
            <p className="text-gray-600 mt-1">
              Schedule blood transfusion for {patient.firstName} {patient.lastName}
            </p>
          </div>
        </div>

        <Card className="max-w-2xl border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">Transfusion Details</CardTitle>
            <CardDescription>Enter the transfusion scheduling information</CardDescription>
          </CardHeader>
          <CardContent>
            <TransfusionScheduleForm patient={patient} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

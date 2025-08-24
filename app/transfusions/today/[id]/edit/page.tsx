import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PatientForm } from "@/components/edit-form"
import { getPatientById } from "@/app/lib/actions"
import { notFound } from "next/navigation"

interface EditPatientPageProps {
  params: Promise<{ id: string }>
}

export default async function EditPatientPage({ params }: EditPatientPageProps) {
  const { id } = await params
  const patient = await getPatientById(id)

  if (!patient) {
    notFound()
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Modifier le patient</h2>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Informations destinées aux patients</CardTitle>
          <CardDescription>Mettre à jour les coordonnées du patient et les informations sur le don de sang</CardDescription>
        </CardHeader>
        <CardContent>
          <PatientForm patient={patient} isEditing={true} />
        </CardContent>
      </Card>
    </div>
  )
}

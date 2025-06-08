import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PatientForm } from "@/components/patient-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NewPatientPage() {
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
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Register New Patient</h1>
            <p className="text-gray-600 mt-1">Enter patient information and medical details</p>
          </div>
        </div>

        <Card className="max-w-4xl border-0 shadow-md">
          <CardHeader className="pb-6">
            <CardTitle className="text-xl text-gray-900">Patient Information</CardTitle>
            <CardDescription>Please fill in all required fields marked with an asterisk (*)</CardDescription>
          </CardHeader>
          <CardContent>
            <PatientForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

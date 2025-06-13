import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Calendar, Phone, Mail, User, Heart, Clock } from "lucide-react"
import Link from "next/link"
import { getPatientById } from "@/app/lib/actions"
import { notFound } from "next/navigation"
import { format, differenceInYears } from "date-fns"

interface ViewPatientPageProps {
  params: Promise<{ id: string }>
}

export default async function ViewPatientPage({ params }: ViewPatientPageProps) {
  const { id } = await params
  const patient = await getPatientById(id)

  if (!patient) {
    notFound()
  }

  const age = patient.dateOfBirth ? differenceInYears(new Date(), new Date(patient.dateOfBirth)) : "N/A"

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/patients">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Patients
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                {patient.firstName} {patient.lastName}
              </h1>
              <p className="text-gray-600 mt-1">Patient ID: {patient._id.slice(-6).toUpperCase()}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Link href={`/transfusions/schedule/${patient._id}`}>
              <Button variant="outline" className="border-gray-300">
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Transfusion
              </Button>
            </Link>
            <Link href={`/patients/${patient._id}/edit`}>
              <Button className="bg-red-600 hover:bg-red-700">
                <Edit className="mr-2 h-4 w-4" />
                Edit Patient
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Personal Information */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900">
                <User className="mr-2 h-5 w-5 text-blue-600" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">First Name</p>
                  <p className="text-gray-900">{patient.firstName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Last Name</p>
                  <p className="text-gray-900">{patient.lastName}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                  <p className="text-gray-900">
                    {patient.dateOfBirth ? format(new Date(patient.dateOfBirth), "MMM dd, yyyy") : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Age</p>
                  <p className="text-gray-900">{age} years</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Gender</p>
                <p className="text-gray-900 capitalize">{patient.gender}</p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900">
                <Phone className="mr-2 h-5 w-5 text-green-600" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Phone Number</p>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <p className="text-gray-900">{patient.phone}</p>
                </div>
              </div>
              {patient.email && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <p className="text-gray-900">{patient.email}</p>
                  </div>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-500">Address</p>
                <p className="text-gray-900">{patient.address || "Not provided"}</p>
              </div>
              {patient.emergencyContact && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Emergency Contact</p>
                  <p className="text-gray-900">{patient.emergencyContact}</p>
                  <p className="text-sm text-gray-600">{patient.emergencyPhone}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Medical Information */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900">
                <Heart className="mr-2 h-5 w-5 text-red-600" />
                Medical Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                <p className="text-sm font-medium text-gray-500">Blood Type</p>
                <Badge className="bg-red-100 text-red-800 font-semibold">{patient.bloodType}</Badge>
                </div>
                <div>
                <p className="text-sm font-medium text-gray-500">ph</p>
                <Badge className="bg-red-100 text-red-800 font-semibold">{patient.ph}</Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Weight</p>
                  <p className="text-gray-900">{patient.weight ? `${patient.weight} kg` : "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Height</p>
                  <p className="text-gray-900">{patient.height ? `${patient.height} cm` : "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Hemoglobin</p>
                  <p className="text-gray-900">{patient.hemoglobinLevel ? `${patient.hemoglobinLevel} g/dL` : "N/A"}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Medical History</p>
                <p className="text-gray-900 text-sm">{patient.medicalHistory || "No medical history recorded"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Donation History */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900">
                <Clock className="mr-2 h-5 w-5 text-purple-600" />
                Donation History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Admission Date</p>
                <p className="text-gray-900">
                  {patient.admissionDate ? format(new Date(patient.admissionDate), "MMM dd, yyyy") : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Last Donation</p>
                <p className="text-gray-900">
                  {patient.lastDonationDate
                    ? format(new Date(patient.lastDonationDate), "MMM dd, yyyy")
                    : "Never donated"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <Badge variant="outline" className="border-green-200 text-green-700">
                  Active Patient
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

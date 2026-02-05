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
                Retour aux Patients
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                {patient.firstName} {patient.lastName}
              </h1>
              <p className="text-gray-600 mt-1">ID Patient : {patient._id.slice(-6).toUpperCase()}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Link href={`/transfusions/schedule/${patient._id}`}>
              <Button variant="outline" className="border-gray-300 bg-transparent">
                <Calendar className="mr-2 h-4 w-4" />
                Planifier une Transfusion
              </Button>
            </Link>
            <Link href={`/patients/${patient._id}/edit`}>
              <Button className="bg-red-600 hover:bg-red-700">
                <Edit className="mr-2 h-4 w-4" />
                Modifier le Patient
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
                Informations Personnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Prénom</p>
                  <p className="text-gray-900">{patient.firstName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Nom</p>
                  <p className="text-gray-900">{patient.lastName}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Date de Naissance</p>
                  <p className="text-gray-900">
                    {patient.dateOfBirth ? format(new Date(patient.dateOfBirth), "dd MMM yyyy") : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Âge</p>
                  <p className="text-gray-900">{age} ans</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Sexe</p>
                <p className="text-gray-900 capitalize">{patient.gender === "male" ? "Masculin" : patient.gender === "female" ? "Féminin" : patient.gender}</p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900">
                <Phone className="mr-2 h-5 w-5 text-green-600" />
                Informations de Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Numéro de Téléphone</p>
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
                <p className="text-sm font-medium text-gray-500">Adresse</p>
                <p className="text-gray-900">{patient.address || "Non fournie"}</p>
              </div>
              {patient.emergencyContact && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Contact d'Urgence</p>
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
                Informations Médicales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                <p className="text-sm font-medium text-gray-500">Groupe Sanguin</p>
                <Badge className="bg-red-100 text-red-800 font-semibold">{patient.bloodType}</Badge>
                </div>
                <div>
                <p className="text-sm font-medium text-gray-500">ph</p>
                <Badge className="bg-red-100 text-red-800 font-semibold">{patient.ph}</Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Poids</p>
                  <p className="text-gray-900">{patient.weight ? `${patient.weight} kg` : "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Taille</p>
                  <p className="text-gray-900">{patient.height ? `${patient.height} cm` : "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Hémoglobine</p>
                  <p className="text-gray-900">{patient.hemoglobinLevel ? `${patient.hemoglobinLevel} g/dL` : "N/A"}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Antécédents Médicaux</p>
                <p className="text-gray-900 text-sm">{patient.medicalHistory || "Aucun antécédent médical enregistré"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Additional Medical Information - Not printed */}
          <Card className="border-0 shadow-md print:hidden">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900">
                <Heart className="mr-2 h-5 w-5 text-orange-600" />
                Informations Complémentaires
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Pathologie</p>
                <p className="text-gray-900 text-sm">{patient.pathologie || "Non renseigné"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Statut d'Allo-immunisation</p>
                <p className="text-gray-900 text-sm">{patient.alloImmunisationStatus || "Non renseigné"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Donation History */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900">
                <Clock className="mr-2 h-5 w-5 text-purple-600" />
                Historique des Dons
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Date d'Admission</p>
                <p className="text-gray-900">
                  {patient.admissionDate ? format(new Date(patient.admissionDate), "dd MMM yyyy") : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Dernier Don</p>
                <p className="text-gray-900">
                  {patient.lastDonationDate
                    ? format(new Date(patient.lastDonationDate), "dd MMM yyyy")
                    : "Jamais donné"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Statut</p>
                <Badge variant="outline" className="border-green-200 text-green-700">
                  Patient Actif
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

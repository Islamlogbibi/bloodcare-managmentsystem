import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Filter } from "lucide-react"
import Link from "next/link"
import { PatientList } from "@/components/patient-list"
import { PatientFilters } from "@/components/patient-filters"
import { PatientPageActions } from "@/components/patient-page-actions"
import { PrintStyles } from "./printStyles"

interface PatientsPageProps {
  searchParams: {
    search?: string
    category?: string
    bloodType?: string
    gender?: string
  }
}

export default function PatientsPage({ searchParams }: PatientsPageProps) {
  return (
    <div className="min-h-screen bg-gray-50/50 print:min-h-0 print:h-auto print:overflow-visible print:bg-white">
      <div className="flex-1 space-y-6 p-6 print:p-0 print:space-y-0">
        {/* Header and Add button - MASQUÉ À L'IMPRESSION */}
        <div className="flex items-center justify-between print:hidden">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dossiers Patients</h1>
            <p className="text-gray-600 mt-1">Gérer tous les dossiers de don de sang des patients</p>
          </div>
          <div className="flex items-center space-x-3">
            <PatientPageActions searchParams={searchParams} />
            <Link href="/patients/new">
              <Button className="bg-red-600 hover:bg-red-700">
                <Plus className="mr-2 h-4 w-4" />
                Ajouter Patient
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters (MASQUÉ À L'IMPRESSION) */}
        <Card className="border-0 shadow-md print:hidden">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-gray-900">Rechercher et Filtrer les Patients</CardTitle>
                <CardDescription>Utilisez les filtres pour trouver rapidement des patients spécifiques</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="border-gray-300">
                <Filter className="mr-2 h-4 w-4" />
                Filtres Avancés
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <PatientFilters />
          </CardContent>
        </Card>

        {/* Patient Table Only (Imprimer ceci) */}
        <div className="print-area">
          <Card className="border-0 shadow-md print:shadow-none print:border-0">
            <CardHeader className="print:hidden">
              <CardTitle className="text-gray-900">Répertoire des Patients</CardTitle>
              <CardDescription>Liste complète des patients enregistrés</CardDescription>
            </CardHeader>
            <CardContent>
              <PatientList searchParams={searchParams} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Print-specific styles */}
      <PrintStyles />
    </div>
  )
}
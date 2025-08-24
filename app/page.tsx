import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Users, Clock, Plus, Activity, AlertTriangle, BarChart3 } from "lucide-react"
import Link from "next/link"
import { getPatientStats } from "./lib/actions"
import { StatsCard } from "@/components/stats-card"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Tableau de bord",
  description: "Tableau de bord de gestion des transfusions sanguines avec statistiques des patients et actions rapides",
}

async function DashboardStats() {
  const stats = await getPatientStats()

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 animate-fade-in">
      <StatsCard
        title="Nombre total de patients"
        value={stats.totalPatients}
        icon={Users}
        description="Patients actifs dans le système"
      />
      <StatsCard
        title="Transfusions d'aujourd'hui"
        value={stats.todayTransfusions}
        icon={Clock}
        description="Prévu pour aujourd'hui"
        trend={stats.urgentCases + " cas urgents"}
        variant="warning"
      />
      <StatsCard
        title="Programme de demain"
        value={stats.tomorrowTransfusions}
        icon={Calendar}
        description="Rendez-vous programmés"
        trend="Tous confirmés"
        variant="success"
      />
      <StatsCard
        title="Cas urgents"
        value={stats.urgentCases}
        icon={AlertTriangle}
        description="Nécessitent une attention immédiate"
        trend="2 critiques"
        variant="destructive"
      />
    </div>
  )
}

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex-1 space-y-6 p-4 md:p-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div className="animate-slide-up">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">Gestion des dons de sang</h1>
            <p className="text-gray-600 mt-1">Prise en charge complète des patients et planification des transfusions</p>
          </div>
          <div className="flex items-center space-x-3">
            <Link href="/patients/new">
              <Button
                size="lg"
                className="bg-red-600 hover:bg-red-700 focus-ring transition-all duration-200 hover:shadow-lg"
                aria-label="Ajouter un nouveau patient au système"
              >
                <Plus className="mr-2 h-5 w-5" />
                Ajouter un patient
              </Button>
            </Link>
          </div>
        </header>

        <Suspense
          fallback={
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="pb-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          }
        >
          <DashboardStats />
        </Suspense>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-slide-up">
          <Card className="border-0 shadow-md card-hover glass-effect">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-gray-900">
                <Users className="mr-3 h-5 w-5 text-red-600" />
                Gestion des patients
              </CardTitle>
              <CardDescription>Gérer les dossiers et informations médicales des patients</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/patients" className="block">
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 border-gray-200 hover:bg-gray-50 focus-ring transition-all duration-200"
                  aria-label="Voir tous les patients du système"
                >
                  <Users className="mr-3 h-4 w-4" />
                  Voir tous les patients
                </Button>
              </Link>
              <Link href="/patients/new" className="block">
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 border-gray-200 hover:bg-gray-50 focus-ring transition-all duration-200"
                  aria-label="Enregistrer un nouveau patient"
                >
                  <Plus className="mr-3 h-4 w-4" />
                  Enregistrer un patient
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md card-hover glass-effect">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-gray-900">
                <Calendar className="mr-3 h-5 w-5 text-blue-600" />
                Planning des transfusions
              </CardTitle>
              <CardDescription>Gérer les rendez-vous de transfusion sanguine</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/transfusions/today" className="block">
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 border-gray-200 hover:bg-gray-50 focus-ring transition-all duration-200"
                  aria-label="Voir le planning des transfusions d'aujourd'hui"
                >
                  <Clock className="mr-3 h-4 w-4" />
                  Planning d'aujourd'hui
                </Button>
              </Link>
              <Link href="/transfusions/tomorrow" className="block">
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 border-gray-200 hover:bg-gray-50 focus-ring transition-all duration-200"
                  aria-label="Voir le planning des transfusions de demain"
                >
                  <Calendar className="mr-3 h-4 w-4" />
                  Planning de demain
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md card-hover glass-effect">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-gray-900">
                <BarChart3 className="mr-3 h-5 w-5 text-green-600" />
                Analyses
              </CardTitle>
              <CardDescription>Voir les performances et les tendances</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/analytics" className="block">
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 border-gray-200 hover:bg-gray-50 focus-ring transition-all duration-200"
                  aria-label="Voir le tableau de bord des analyses"
                >
                  <Activity className="mr-3 h-4 w-4" />
                  Tableau d'analyses
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 animate-slide-up">
          <Card className="border-0 shadow-md card-hover">
            <CardHeader>
              <CardTitle className="text-gray-900">Actions rapides</CardTitle>
              <CardDescription>Fonctions fréquemment utilisées</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3" role="group" aria-label="Boutons d'actions rapides">
                <Link href="/patients/new">
                  <Button
                    variant="outline"
                    className="w-full h-16 flex-col space-y-1 border-gray-200 hover:bg-gray-50 focus-ring transition-all duration-200 hover:shadow-md"
                    aria-label="Ajouter un patient"
                  >
                    <Plus className="h-5 w-5" />
                    <span className="text-xs">Ajouter patient</span>
                  </Button>
                </Link>
                <Link href="/transfusions/schedule">
                  <Button
                    variant="outline"
                    className="w-full h-16 flex-col space-y-1 border-gray-200 hover:bg-gray-50 focus-ring transition-all duration-200 hover:shadow-md"
                    aria-label="Programmer une transfusion"
                  >
                    <Calendar className="h-5 w-5" />
                    <span className="text-xs">Programmer</span>
                  </Button>
                </Link>
                <Link href="/analytics">
                  <Button
                    variant="outline"
                    className="w-full h-16 flex-col space-y-1 border-gray-200 hover:bg-gray-50 focus-ring transition-all duration-200 hover:shadow-md"
                    aria-label="Voir les analyses"
                  >
                    <BarChart3 className="h-5 w-5" />
                    <span className="text-xs">Analyses</span>
                  </Button>
                </Link>
                <Link href="/patients">
                  <Button
                    variant="outline"
                    className="w-full h-16 flex-col space-y-1 border-gray-200 hover:bg-gray-50 focus-ring transition-all duration-200 hover:shadow-md"
                    aria-label="Voir tous les patients"
                  >
                    <Users className="h-5 w-5" />
                    <span className="text-xs">Patients</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

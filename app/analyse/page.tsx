import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Users, Droplets, Activity } from "lucide-react"

export const metadata: Metadata = {
  title: "Analyse - BloodCare",
  description: "Analyses et rapports détaillés du système de gestion sanguine",
}

export default function AnalysePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <TrendingUp className="h-6 w-6 text-blue-600" />
        <h1 className="text-3xl font-bold tracking-tight">Analyse</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Analyses Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Bientôt disponible</div>
            <p className="text-xs text-muted-foreground">Analyses détaillées des données patients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Analyses Sanguines</CardTitle>
            <Droplets className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Bientôt disponible</div>
            <p className="text-xs text-muted-foreground">Rapports sur les groupes sanguins et compatibilités</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Analyses Activité</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Bientôt disponible</div>
            <p className="text-xs text-muted-foreground">Suivi des activités et performances</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rapports Détaillés</CardTitle>
          <CardDescription>
            Cette section contiendra des analyses approfondies et des rapports personnalisés
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Les fonctionnalités d'analyse avancées seront disponibles prochainement. Vous pourrez générer des rapports
            détaillés sur les patients, les transfusions, et les statistiques du système.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Calendar, Droplets, Users, Activity, TestTube, Heart } from "lucide-react"
import { getAnalyticsStats } from "@/app/lib/actions"
import type { DateRange } from "react-day-picker"

interface AnalyticsStatsProps {
  dateRange: DateRange | undefined
}

export async function AnalyticsStats({ dateRange }: AnalyticsStatsProps) {
  const stats = await getAnalyticsStats(dateRange)

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border-0 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700">Total Transfusions</CardTitle>
          <Activity className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">{stats.totalTransfusions}</div>
          <div className="flex items-center text-xs text-green-600">
            <TrendingUp className="h-3 w-3 mr-1" />
            {stats.transfusionTrend > 0 ? "+" : ""}
            {stats.transfusionTrend}% vs période précédente
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700">Nombre de poches</CardTitle>
          <Droplets className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">{stats.totalBloodUnits}</div>
          <div className="flex items-center text-xs text-blue-600">
            <Activity className="h-3 w-3 mr-1" />
            {stats.avgBloodUnitsPerTransfusion.toFixed(1)} moyenne par transfusion
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700">Niveau Hb moyen</CardTitle>
          <Heart className="h-4 w-4 text-pink-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">{stats.avgHemoglobin.toFixed(1)} g/dL</div>
          <div className="flex items-center text-xs text-gray-600">
            <TestTube className="h-3 w-3 mr-1" />
            Plage: {stats.minHemoglobin}-{stats.maxHemoglobin} g/dL
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700">Cas critiques</CardTitle>
          <Activity className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">{stats.criticalCases}</div>
          <div className="flex items-center text-xs text-yellow-600">
            <TrendingUp className="h-3 w-3 mr-1" />
            {stats.criticalCasesTrend > 0 ? "+" : ""}
            {stats.criticalCasesTrend} vs semaine précédente
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700">Patients actifs</CardTitle>
          <Users className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">{stats.activePatients}</div>
          <div className="flex items-center text-xs text-green-600">
            <TrendingUp className="h-3 w-3 mr-1" />+{stats.newPatientsThisPeriod} nouveaux patients
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700">Transfusions aujourd'hui</CardTitle>
          <Calendar className="h-4 w-4 text-indigo-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">{stats.todayTransfusions}</div>
          <div className="flex items-center text-xs text-blue-600">
            <Activity className="h-3 w-3 mr-1" />
            {stats.completedToday} complétées
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700">Phénotypes rares</CardTitle>
          <TestTube className="h-4 w-4 text-emerald-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">{stats.rarePhenotypes}</div>
          <div className="flex items-center text-xs text-emerald-600">
            <Users className="h-3 w-3 mr-1" />
            {stats.rarePhenotypePercentage.toFixed(1)}% des patients
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700">Groupe sanguin dominant</CardTitle>
          <Droplets className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">{stats.dominantBloodType}</div>
          <div className="flex items-center text-xs text-gray-600">
            <Users className="h-3 w-3 mr-1" />
            {stats.dominantBloodTypePercentage}% des patients
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

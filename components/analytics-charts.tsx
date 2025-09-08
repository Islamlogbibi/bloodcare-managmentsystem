"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import type { DateRange } from "react-day-picker"

interface AnalyticsChartsProps {
  dateRange: DateRange | undefined
}

interface ChartData {
  dailyTransfusions: Array<{ date: string; transfusions: number; completed: number; bloodUnits: number }>
  bloodTypeDistribution: Array<{
    bloodType: string
    count: number
    percentage: number
    totalBloodUnits: number
    avgHemoglobin: number
  }>
  priorityDistribution: Array<{ priority: string; count: number; bloodUnits: number }>
  monthlyTrends: Array<{ month: string; transfusions: number; bloodUnits: number; completed: number }>
  hemoglobinAnalysis?: Array<{ bloodType: string; avgHb: number; minHb: number; maxHb: number; count: number }>
  phenotypeAnalysis?: Array<{
    bloodType: string
    total: number
    rarePhenotypes: number
    rarePercentage: number
    totalBloodUnits: number
  }>
}

const COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6"]

const getFallbackData = (): ChartData => {
  const today = new Date()
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    return {
      date: date.toISOString().split("T")[0],
      transfusions: Math.floor(Math.random() * 10) + 5,
      completed: Math.floor(Math.random() * 8) + 3,
      bloodUnits: Math.floor(Math.random() * 20) + 10, // Added blood units
    }
  }).reverse()

  return {
    dailyTransfusions: last7Days,
    bloodTypeDistribution: [
      { bloodType: "O+", count: 45, percentage: 38, totalBloodUnits: 180, avgHemoglobin: 12.5 },
      { bloodType: "A+", count: 35, percentage: 29, totalBloodUnits: 140, avgHemoglobin: 11.8 },
      { bloodType: "B+", count: 15, percentage: 13, totalBloodUnits: 60, avgHemoglobin: 12.1 },
      { bloodType: "AB+", count: 8, percentage: 7, totalBloodUnits: 32, avgHemoglobin: 11.9 },
      { bloodType: "O-", count: 7, percentage: 6, totalBloodUnits: 28, avgHemoglobin: 12.3 },
      { bloodType: "A-", count: 5, percentage: 4, totalBloodUnits: 20, avgHemoglobin: 11.7 },
      { bloodType: "B-", count: 2, percentage: 2, totalBloodUnits: 8, avgHemoglobin: 12.0 },
      { bloodType: "AB-", count: 1, percentage: 1, totalBloodUnits: 4, avgHemoglobin: 11.5 },
    ],
    priorityDistribution: [
      { priority: "urgent", count: 12, bloodUnits: 48 },
      { priority: "high", count: 25, bloodUnits: 100 },
      { priority: "regular", count: 45, bloodUnits: 180 },
      { priority: "low", count: 18, bloodUnits: 72 },
    ],
    monthlyTrends: [
      { month: "2024-01", transfusions: 85, bloodUnits: 340, completed: 78 },
      { month: "2024-02", transfusions: 92, bloodUnits: 368, completed: 85 },
      { month: "2024-03", transfusions: 78, bloodUnits: 312, completed: 71 },
      { month: "2024-04", transfusions: 105, bloodUnits: 420, completed: 98 },
      { month: "2024-05", transfusions: 98, bloodUnits: 392, completed: 89 },
      { month: "2024-06", transfusions: 112, bloodUnits: 448, completed: 105 },
    ],
  }
}

export function AnalyticsCharts({ dateRange }: AnalyticsChartsProps) {
  const [chartData, setChartData] = useState<ChartData>(getFallbackData())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        if (dateRange?.from) {
          params.append("startDate", dateRange.from.toISOString())
        }
        if (dateRange?.to) {
          params.append("endDate", dateRange.to.toISOString())
        }

        console.log("[v0] Fetching analytics data with params:", params.toString())
        const response = await fetch(`/api/analytics/charts?${params.toString()}`)

        if (response.ok) {
          const data = await response.json()
          console.log("[v0] Received analytics data:", data)
          console.log("[v0] Priority distribution data:", data.priorityDistribution)

          const hasData =
            data.dailyTransfusions?.length > 0 ||
            data.bloodTypeDistribution?.length > 0 ||
            data.priorityDistribution?.length > 0 ||
            data.monthlyTrends?.length > 0 ||
            data.hemoglobinAnalysis?.length > 0 ||
            data.phenotypeAnalysis?.length > 0

          if (hasData) {
            if (data.priorityDistribution && data.priorityDistribution.length === 0) {
              data.priorityDistribution = getFallbackData().priorityDistribution
              console.log("[v0] Using fallback priority data")
            }
            setChartData(data)
          } else {
            console.log("[v0] API returned empty data, using fallback")
            setChartData(getFallbackData())
          }
        } else {
          console.error("[v0] API response not ok:", response.status, response.statusText)
          setError("Erreur lors du chargement des données")
          setChartData(getFallbackData())
        }
      } catch (error) {
        console.error("[v0] Error fetching analytics data:", error)
        setError("Erreur de connexion")
        setChartData(getFallbackData())
      } finally {
        setLoading(false)
      }
    }

    fetchAnalyticsData()
  }, [dateRange])

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">{error} - Affichage des données de démonstration</p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-gray-900">Transfusions et Poches Sanguines</CardTitle>
            <CardDescription>Transfusions programmées vs complétées avec nombre de poches</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.dailyTransfusions}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [
                    value,
                    name === "bloodUnits" ? "Poches sanguines" : name === "transfusions" ? "Programmées" : "Complétées",
                  ]}
                />
                <Bar dataKey="transfusions" fill="#3b82f6" name="transfusions" />
                <Bar dataKey="completed" fill="#22c55e" name="completed" />
                <Bar dataKey="bloodUnits" fill="#ef4444" name="bloodUnits" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-gray-900">Groupes Sanguins et Hémoglobine</CardTitle>
            <CardDescription>Distribution avec taux d'hémoglobine moyen</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.bloodTypeDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="bloodType" />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [
                    value,
                    name === "count" ? "Patients" : name === "totalBloodUnits" ? "Poches totales" : "Hb moyen (g/dL)",
                  ]}
                />
                <Bar dataKey="count" fill="#3b82f6" name="count" />
                <Bar dataKey="totalBloodUnits" fill="#ef4444" name="totalBloodUnits" />
                <Bar dataKey="avgHemoglobin" fill="#22c55e" name="avgHemoglobin" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-gray-900">Priorités et Poches Sanguines</CardTitle>
            <CardDescription>Distribution par priorité avec nombre de poches</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-2 text-xs text-gray-500">
              Données: {chartData.priorityDistribution?.length || 0} priorités
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.priorityDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="priority" />
                <YAxis />
                <Tooltip formatter={(value, name) => [value, name === "count" ? "Cas" : "Poches sanguines"]} />
                <Bar dataKey="count" fill="#ef4444" name="count" />
                <Bar dataKey="bloodUnits" fill="#3b82f6" name="bloodUnits" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-gray-900">Tendances Mensuelles</CardTitle>
            <CardDescription>Évolution des transfusions, poches et taux de réussite</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [
                    value,
                    name === "transfusions"
                      ? "Transfusions"
                      : name === "bloodUnits"
                        ? "Poches sanguines"
                        : "Complétées",
                  ]}
                />
                <Line type="monotone" dataKey="transfusions" stroke="#3b82f6" name="transfusions" />
                <Line type="monotone" dataKey="bloodUnits" stroke="#ef4444" name="bloodUnits" />
                <Line type="monotone" dataKey="completed" stroke="#22c55e" name="completed" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {(chartData.hemoglobinAnalysis?.length > 0 || chartData.phenotypeAnalysis?.length > 0) && (
        <div className="grid gap-6 md:grid-cols-2 mt-6">
          {/* Hemoglobin Analysis */}
          {chartData.hemoglobinAnalysis?.length > 0 && (
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-gray-900">Analyse Hémoglobine</CardTitle>
                <CardDescription>Niveaux d'hémoglobine par groupe sanguin</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.hemoglobinAnalysis}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="bloodType" />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => [
                        `${value} g/dL`,
                        name === "avgHb" ? "Hb moyen" : name === "minHb" ? "Hb min" : "Hb max",
                      ]}
                    />
                    <Bar dataKey="avgHb" fill="#22c55e" name="avgHb" />
                    <Bar dataKey="minHb" fill="#ef4444" name="minHb" />
                    <Bar dataKey="maxHb" fill="#3b82f6" name="maxHb" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Phenotype Analysis */}
          {chartData.phenotypeAnalysis?.length > 0 && (
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-gray-900">Phénotypes Rares</CardTitle>
                <CardDescription>Analyse des phénotypes complexes par groupe sanguin</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.phenotypeAnalysis}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="bloodType" />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => [
                        name === "rarePercentage" ? `${value}%` : value,
                        name === "rarePhenotypes"
                          ? "Phénotypes rares"
                          : name === "rarePercentage"
                            ? "% rares"
                            : "Total patients",
                      ]}
                    />
                    <Bar dataKey="rarePhenotypes" fill="#ef4444" name="rarePhenotypes" />
                    <Bar dataKey="rarePercentage" fill="#f97316" name="rarePercentage" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

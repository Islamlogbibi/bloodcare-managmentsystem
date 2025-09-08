"use client"

import { Suspense, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AnalyticsStats } from "@/components/analytics-stats"
import { AnalyticsCharts } from "@/components/analytics-charts"
import { AnalyticsPageActions } from "@/components/analytics-page-actions"
import { DatePickerWithRange } from "@/components/date-range-picker"
import type { DateRange } from "react-day-picker"
import { subDays } from "date-fns"
import { RefreshCw, TrendingUp, BarChart3 } from "lucide-react"

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })
  const [refreshKey, setRefreshKey] = useState(0)

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

  const handleQuickSelect = (days: number) => {
    setDateRange({
      from: subDays(new Date(), days),
      to: new Date(),
    })
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="flex-1 space-y-6 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center">
              <BarChart3 className="mr-3 h-8 w-8 text-blue-600" />
              Tableau d'analyses
            </h1>
            <p className="text-gray-600 mt-1">Analyses détaillées des transfusions et tendances</p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <DatePickerWithRange date={dateRange} setDate={setDateRange} />
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => handleQuickSelect(7)} className="text-xs">
                7 jours
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleQuickSelect(30)} className="text-xs">
                30 jours
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleQuickSelect(90)} className="text-xs">
                90 jours
              </Button>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handleRefresh} className="flex items-center bg-transparent">
                <RefreshCw className="mr-2 h-4 w-4" />
                Actualiser
              </Button>
              <AnalyticsPageActions />
            </div>
          </div>
        </div>

        <Card className="border-0 shadow-md bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-blue-600" />
              Période d'analyse
            </CardTitle>
            <CardDescription>
              {dateRange?.from && dateRange?.to ? (
                <>
                  Du {dateRange.from.toLocaleDateString("fr-FR")} au {dateRange.to.toLocaleDateString("fr-FR")} (
                  {Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24))} jours)
                </>
              ) : (
                "Sélectionnez une période pour voir les analyses"
              )}
            </CardDescription>
          </CardHeader>
        </Card>

        <Suspense
          fallback={
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(8)].map((_, i) => (
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
          <AnalyticsStats dateRange={dateRange} key={`stats-${refreshKey}`} />
        </Suspense>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-gray-900">Graphiques et tendances</CardTitle>
            <CardDescription>Représentation visuelle des données de transfusion</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="h-96 bg-gray-100 rounded animate-pulse"></div>}>
              <AnalyticsCharts dateRange={dateRange} key={`charts-${refreshKey}`} />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

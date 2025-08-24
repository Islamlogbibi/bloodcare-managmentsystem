import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AnalyticsStats } from "@/components/analytics-stats"
import { AnalyticsCharts } from "@/components/analytics-charts"
import { AnalyticsPageActions } from "@/components/analytics-page-actions"

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">Monitor blood donation trends and statistics</p>
          </div>
          <AnalyticsPageActions />
        </div>

        <Suspense fallback={<div>Loading analytics...</div>}>
          <AnalyticsStats />
        </Suspense>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-gray-900">Trends & Insights</CardTitle>
            <CardDescription>Visual representation of donation patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>Loading charts...</div>}>
              <AnalyticsCharts />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

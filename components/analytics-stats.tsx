import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Calendar, Clock, AlertTriangle } from "lucide-react"
import { getAnalyticsStats } from "@/app/lib/actions"

export async function AnalyticsStats() {
  const stats = await getAnalyticsStats()

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border-0 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700">Total Transfusions</CardTitle>
          <Calendar className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">{stats.totalTransfusions}</div>
          <div className="flex items-center text-xs text-green-600">
            <TrendingUp className="h-3 w-3 mr-1" />
            +12% from last month
          </div>
        </CardContent>
      </Card>

      
      <Card className="border-0 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700">Critical Cases</CardTitle>
          <AlertTriangle className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">{stats.criticalCases}</div>
          <div className="flex items-center text-xs text-yellow-600">
            <TrendingUp className="h-3 w-3 mr-1" />
            +3 from last week
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

import { NextResponse } from "next/server"
import { getAnalyticsStats } from "@/app/lib/actions"

export async function GET() {
  try {
    // Get analytics data
    const stats = await getAnalyticsStats()

    // Get the current date
    const currentDate = new Date().toISOString().split("T")[0]

    // Create CSV content
    let csv = "Metric,Value,Date\n"
    csv += `Total Transfusions,${stats.totalTransfusions},${currentDate}\n`
    csv += `Success Rate,${stats.successRate}%,${currentDate}\n`
    csv += `Average Wait Time,${stats.avgWaitTime} min,${currentDate}\n`
    csv += `Critical Cases,${stats.criticalCases},${currentDate}\n`

    // Add monthly data
    if (stats.monthlyData) {
      csv += "\nMonth,Transfusions,Success Rate\n"
      stats.monthlyData.forEach((month) => {
        csv += `${month.month},${month.transfusions},${month.successRate}%\n`
      })
    }

    // Add blood type distribution
    if (stats.bloodTypeDistribution) {
      csv += "\nBlood Type,Count,Percentage\n"
      Object.entries(stats.bloodTypeDistribution).forEach(([bloodType, count]) => {
        const percentage = (((count as number) / stats.totalPatients) * 100).toFixed(1)
        csv += `${bloodType},${count},${percentage}%\n`
      })
    }

    // Return CSV as a file
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="analytics-${currentDate}.csv"`,
      },
    })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ error: "Failed to export analytics" }, { status: 500 })
  }
}

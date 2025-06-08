"use client"

import { useEffect, useState } from "react"

export function AnalyticsCharts() {
  const [chartData, setChartData] = useState<number[]>([])

  useEffect(() => {
    // Simulate chart data
    setChartData(Array.from({ length: 12 }, () => Math.floor(Math.random() * 100) + 20))
  }, [])

  const maxValue = Math.max(...chartData)

  return (
    <div className="h-64 flex items-end justify-between space-x-2">
      {chartData.map((value, index) => (
        <div key={index} className="flex flex-col items-center space-y-2 flex-1">
          <div
            className="bg-blue-500 rounded-t-sm w-full transition-all duration-500 ease-in-out"
            style={{ height: `${(value / maxValue) * 200}px` }}
          ></div>
          <span className="text-xs text-gray-500 transform -rotate-45">
            {new Date(2024, index).toLocaleDateString("en-US", { month: "short" })}
          </span>
        </div>
      ))}
    </div>
  )
}

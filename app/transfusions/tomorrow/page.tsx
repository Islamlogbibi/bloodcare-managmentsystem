import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Printer, Calendar, Plus } from "lucide-react"
import { TomorrowTransfusionList } from "@/components/tomorrow-transfusion-list"
import Link from "next/link"
import { getTomorrowTransfusions } from "@/app/lib/actions"

export default async function TomorrowTransfusionsPage() {
  const transfusions = await getTomorrowTransfusions()

  const now = new Date()

  const algeriaTime = new Intl.DateTimeFormat("en-US", {
    timeZone: "Africa/Algiers",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(now)

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Les transfusions de demain</h1>
            <p className="text-gray-600 mt-1">{algeriaTime}</p>
          </div>
        </div>

        <Card className="border-0 shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-gray-900">
              <Calendar className="mr-2 h-5 w-5 text-green-600" />
              Programme de demain
            </CardTitle>
            <CardDescription>Patients devant recevoir des transfusions sanguines demain</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense
              fallback={
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-gray-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              }
            >
              <TomorrowTransfusionList transfusions={transfusions} />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Printer, Calendar, Plus } from "lucide-react"
import { TomorrowTransfusionList } from "@/components/tomorrow-transfusion-list"
import Link from "next/link"
import { getTomorrowTransfusions } from "@/app/lib/actions"

export default async function TomorrowTransfusionsPage() {
  const transfusions = await getTomorrowTransfusions()

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Tomorrow's Transfusions</h1>
            <p className="text-gray-600 mt-1">
              {tomorrow.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" className="border-gray-300">
              <Printer className="mr-2 h-4 w-4" />
              Print Schedule
            </Button>
            <Link href="/transfusions/schedule">
              <Button className="bg-red-600 hover:bg-red-700">
                <Plus className="mr-2 h-4 w-4" />
                Schedule New
              </Button>
            </Link>
          </div>
        </div>

        <Card className="border-0 shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-gray-900">
              <Calendar className="mr-2 h-5 w-5 text-green-600" />
              Tomorrow's Schedule
            </CardTitle>
            <CardDescription>Patients scheduled for blood transfusions tomorrow</CardDescription>
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

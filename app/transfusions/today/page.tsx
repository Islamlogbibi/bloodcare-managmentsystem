import { Suspense } from "react"
import { TodayTransfusionList } from "@/components/today-transfusion-list"
import { getTodayTransfusions } from "@/app/lib/actions"

export default async function TodayTransfusionsPage() {
  const transfusions = await getTodayTransfusions()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Today's Transfusions</h1>
        <p className="text-gray-600">Manage and track today's scheduled blood transfusions</p>
      </div>

      <Suspense fallback={<div>Loading transfusions...</div>}>
        <TodayTransfusionList transfusions={transfusions} />
      </Suspense>
    </div>
  )
}

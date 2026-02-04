export const dynamic = "force-dynamic";

import { Suspense } from "react"
import { TodayTransfusionList } from "@/components/today-transfusion-list"
import { getTodayTransfusions } from "@/app/lib/actions"

export default async function TodayTransfusionsPage() {
  const transfusions = await getTodayTransfusions()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Les transfusions d'aujourd'hui</h1>
        <p className="text-gray-600">Gérer et suivre les transfusions sanguines programmées aujourd'hui</p>
      </div>

      <Suspense fallback={<div>Chargement des transfusions...</div>}>
        <TodayTransfusionList transfusions={transfusions} />
      </Suspense>
    </div>
  )
}

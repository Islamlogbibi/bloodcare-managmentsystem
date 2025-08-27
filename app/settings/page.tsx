import { SettingsForm } from "@/components/settings-form"

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Paramètres</h1>
            <p className="text-gray-600 mt-1">Gérez les préférences et la configuration de votre application</p>
          </div>
        </div>

        <SettingsForm />
      </div>
    </div>
  )
}

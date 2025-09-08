"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Shield, Mail, Calendar } from "lucide-react"
import Link from "next/link"

interface AdminUser {
  _id: string
  email: string
  fullName: string
  role: string
  department: string
  createdAt: string
  lastLogin?: string
}

export default function AdminInfoPage() {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchAdminUsers()
  }, [])

  const fetchAdminUsers = async () => {
    try {
      const response = await fetch("/api/admin-info")
      const data = await response.json()

      if (response.ok) {
        setAdminUsers(data.admins)
      } else {
        setError(data.error || "Erreur lors de la récupération des informations")
      }
    } catch (error) {
      setError("Erreur de connexion")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des informations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-red-600 mb-2">Informations Administrateur</h1>
          <p className="text-gray-600">Comptes administrateur existants dans le système</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {adminUsers.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucun administrateur trouvé</h3>
              <p className="text-gray-500 mb-4">Il semble qu'il n'y ait pas d'administrateur dans le système.</p>
              <Link href="/setup-admin">
                <Button>Créer un administrateur</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {adminUsers.map((admin) => (
              <Card key={admin._id} className="border-l-4 border-l-red-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-red-600" />
                    {admin.fullName}
                  </CardTitle>
                  <CardDescription>Administrateur - {admin.department}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Email:</span>
                      <span className="text-blue-600">{admin.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Créé le:</span>
                      <span>{new Date(admin.createdAt).toLocaleDateString("fr-FR")}</span>
                    </div>
                    {admin.lastLogin && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">Dernière connexion:</span>
                        <span>{new Date(admin.lastLogin).toLocaleDateString("fr-FR")}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="text-center mt-8">
              <Link href="/login">
                <Button size="lg" className="mr-4">
                  Se connecter
                </Button>
              </Link>
              <Link href="/setup-admin">
                <Button variant="outline" size="lg">
                  Retour à la configuration
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

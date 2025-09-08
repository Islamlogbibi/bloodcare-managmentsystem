"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, User } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"

// Available languages
const languages = {
  en: {
    name: "English",
    profileSettings: "Profile Settings",
    updatePersonalInfo: "Update your personal information",
    fullName: "Full Name",
    email: "Email",
    phone: "Phone",
    department: "Department",
    saveProfile: "Save Profile",
    saving: "Saving...",
    notificationSettings: "Notification Settings",
    configureNotifications: "Configure your notification preferences",
    emailNotifications: "Email Notifications",
    receiveEmailAlerts: "Receive email alerts for important events",
    urgentCaseAlerts: "Urgent Case Alerts",
    getNotifiedEmergency: "Get notified of emergency transfusions",
    dailyReports: "Daily Reports",
    receiveDailySummary: "Receive daily summary reports",
    systemMaintenance: "System Maintenance",
    notificationsAboutSystem: "Notifications about system updates",
    systemSettings: "System Settings",
    configureSystem: "Configure system preferences",
    timezone: "Timezone",
    language: "Language",
    dateFormat: "Date Format",
    autoSave: "Auto-save",
    automaticallySave: "Automatically save changes",
  },
  fr: {
    name: "Français",
    profileSettings: "Paramètres du Profil",
    updatePersonalInfo: "Mettre à jour vos informations personnelles",
    fullName: "Nom Complet",
    email: "Email",
    phone: "Téléphone",
    department: "Département",
    saveProfile: "Enregistrer le Profil",
    saving: "Enregistrement...",
    notificationSettings: "Paramètres de Notification",
    configureNotifications: "Configurez vos préférences de notification",
    emailNotifications: "Notifications par Email",
    receiveEmailAlerts: "Recevoir des alertes par email pour les événements importants",
    urgentCaseAlerts: "Alertes de Cas Urgents",
    getNotifiedEmergency: "Être notifié des transfusions d'urgence",
    dailyReports: "Rapports Quotidiens",
    receiveDailySummary: "Recevoir des rapports quotidiens",
    systemMaintenance: "Maintenance du Système",
    notificationsAboutSystem: "Notifications concernant les mises à jour du système",
    systemSettings: "Paramètres du Système",
    configureSystem: "Configurer les préférences du système",
    timezone: "Fuseau Horaire",
    language: "Langue",
    dateFormat: "Format de Date",
    autoSave: "Sauvegarde Automatique",
    automaticallySave: "Enregistrer automatiquement les modifications",
  },
  es: {
    name: "Español",
    profileSettings: "Configuración de Perfil",
    updatePersonalInfo: "Actualice su información personal",
    fullName: "Nombre Completo",
    email: "Correo Electrónico",
    phone: "Teléfono",
    department: "Departamento",
    saveProfile: "Guardar Perfil",
    saving: "Guardando...",
    notificationSettings: "Configuración de Notificaciones",
    configureNotifications: "Configure sus preferencias de notificación",
    emailNotifications: "Notificaciones por Correo",
    receiveEmailAlerts: "Recibir alertas por correo para eventos importantes",
    urgentCaseAlerts: "Alertas de Casos Urgentes",
    getNotifiedEmergency: "Recibir notificaciones de transfusiones de emergencia",
    dailyReports: "Informes Diarios",
    receiveDailySummary: "Recibir informes diarios",
    systemMaintenance: "Mantenimiento del Sistema",
    notificationsAboutSystem: "Notificaciones sobre actualizaciones del sistema",
    systemSettings: "Configuración del Sistema",
    configureSystem: "Configure las preferencias del sistema",
    timezone: "Zona Horaria",
    language: "Idioma",
    dateFormat: "Formato de Fecha",
    autoSave: "Guardado Automático",
    automaticallySave: "Guardar cambios automáticamente",
  },
}

export function SettingsForm() {
  const { user, checkAuth } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    phone: "",
    department: "",
  })

  // Current language text based on system settings
  const [currentLang, setCurrentLang] = useState(languages.fr)

  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.fullName || user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        department: user.department || "",
      })
    }
  }, [user])

  const handleProfileSave = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: profileData.fullName,
          phone: profileData.phone,
          department: profileData.department,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update profile")
      }

      await checkAuth()

      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été mises à jour avec succès.",
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de sauvegarder le profil.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Profile Settings */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-900">
            <User className="mr-2 h-5 w-5 text-blue-600" />
            {currentLang.profileSettings}
          </CardTitle>
          <CardDescription>{currentLang.updatePersonalInfo}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">{currentLang.fullName}</Label>
            <Input
              id="fullName"
              value={profileData.fullName}
              onChange={(e) => setProfileData((prev) => ({ ...prev, fullName: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{currentLang.email}</Label>
            <Input id="email" type="email" value={profileData.email} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">L'email ne peut pas être modifié</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">{currentLang.phone}</Label>
            <Input
              id="phone"
              type="tel"
              value={profileData.phone}
              onChange={(e) => setProfileData((prev) => ({ ...prev, phone: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="department">{currentLang.department}</Label>
            <Select
              value={profileData.department}
              onValueChange={(value) => setProfileData((prev) => ({ ...prev, department: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hematology">Hématologie</SelectItem>
                <SelectItem value="emergency">Urgences</SelectItem>
                <SelectItem value="surgery">Chirurgie</SelectItem>
                <SelectItem value="administration">Administration</SelectItem>
                <SelectItem value="laboratory">Laboratoire</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="w-full bg-red-600 hover:bg-red-700" onClick={handleProfileSave} disabled={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? currentLang.saving : currentLang.saveProfile}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

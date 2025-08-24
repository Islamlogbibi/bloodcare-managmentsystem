"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type Language = "en" | "fr" | "es"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations = {
  en: {
    // Navigation
    dashboard: "Dashboard",
    patients: "Patients",
    analytics: "Analytics",
    settings: "Settings",
    todayTransfusions: "Today's Transfusions",
    tomorrowTransfusions: "Tomorrow's Transfusions",

    // Patient Table Headers
    nomEtPrenom: "NAME",
    gp: "GP",
    ph: "PH",
    f: "F",
    c: "C",
    l: "L",
    derniereT: "LAST T",
    prochaineT: "NEXT T",
    jecoulés: "DAYS ELAPSED",
    renseignements: "ACTIONS",

    // Actions
    view: "View",
    edit: "Edit",
    delete: "Delete",
    schedule: "Schedule",
    done: "Done",
    completed: "Completed",
    markAsDone: "Mark as Done",

    // Common
    loading: "Loading...",
    save: "Save",
    cancel: "Cancel",
    confirm: "Confirm",

    // Dashboard
    totalPatients: "Total Patients",
    urgentCases: "Urgent Cases",

    // Scheduling
    scheduleTransfusion: "Schedule Transfusion",
    regular: "Regular",
    urgent: "Urgent",
    scheduledForTomorrow: "Scheduled for tomorrow at 9:00 AM",
    scheduledForToday: "Scheduled for today at next available slot",
  },
  fr: {
    // Navigation
    dashboard: "Tableau de Bord",
    patients: "Patients",
    analytics: "Analyses",
    settings: "Paramètres",
    todayTransfusions: "Transfusions d'Aujourd'hui",
    tomorrowTransfusions: "Transfusions de Demain",

    // Patient Table Headers
    nomEtPrenom: "NOM ET PRÉNOM",
    gp: "GP",
    ph: "PH",
    f: "F",
    c: "C",
    l: "L",
    derniereT: "DERNIÈRE T",
    prochaineT: "PROCHAINE T",
    jecoulés: "J/ÉCOULÉS",
    renseignements: "ACTIONS",

    // Actions
    view: "Voir",
    edit: "Modifier",
    delete: "Supprimer",
    schedule: "Programmer",
    done: "Terminé",
    completed: "Complété",
    markAsDone: "Marquer comme Terminé",

    // Common
    loading: "Chargement...",
    save: "Enregistrer",
    cancel: "Annuler",
    confirm: "Confirmer",

    // Dashboard
    totalPatients: "Total des Patients",
    urgentCases: "Cas Urgents",

    // Scheduling
    scheduleTransfusion: "Programmer une Transfusion",
    regular: "Régulier",
    urgent: "Urgent",
    scheduledForTomorrow: "Programmé pour demain à 9h00",
    scheduledForToday: "Programmé pour aujourd'hui au prochain créneau disponible",
  },
  es: {
    // Navigation
    dashboard: "Panel de Control",
    patients: "Pacientes",
    analytics: "Análisis",
    settings: "Configuración",
    todayTransfusions: "Transfusiones de Hoy",
    tomorrowTransfusions: "Transfusiones de Mañana",

    // Patient Table Headers
    nomEtPrenom: "NOMBRE",
    gp: "GP",
    ph: "PH",
    f: "F",
    c: "C",
    l: "L",
    derniereT: "ÚLTIMA T",
    prochaineT: "PRÓXIMA T",
    jecoulés: "DÍAS TRANSCURRIDOS",
    renseignements: "ACCIONES",

    // Actions
    view: "Ver",
    edit: "Editar",
    delete: "Eliminar",
    schedule: "Programar",
    done: "Hecho",
    completed: "Completado",
    markAsDone: "Marcar como Hecho",

    // Common
    loading: "Cargando...",
    save: "Guardar",
    cancel: "Cancelar",
    confirm: "Confirmar",

    // Dashboard
    totalPatients: "Total de Pacientes",
    urgentCases: "Casos Urgentes",

    // Scheduling
    scheduleTransfusion: "Programar Transfusión",
    regular: "Regular",
    urgent: "Urgente",
    scheduledForTomorrow: "Programado para mañana a las 9:00 AM",
    scheduledForToday: "Programado para hoy en el próximo horario disponible",
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")

  useEffect(() => {
    // Load language from localStorage
    const savedSettings = localStorage.getItem("systemSettings")
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      if (settings.language) {
        setLanguage(settings.language)
        document.documentElement.lang = settings.language
      }
    }


    const handleLanguageChange = (event: CustomEvent) => {
      setLanguage(event.detail.language)
      document.documentElement.lang = event.detail.language
    }

    window.addEventListener("languageChanged", handleLanguageChange as EventListener)
    return () => {
      window.removeEventListener("languageChanged", handleLanguageChange as EventListener)
    }
  }, [])

  const t = (key: string): string => {
    return translations[language][key as keyof (typeof translations)[typeof language]] || key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}

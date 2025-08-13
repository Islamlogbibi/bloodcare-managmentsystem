"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Save, User, Phone, Heart, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { createPatient, updatePatient } from "@/app/lib/actions"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { z } from "zod"

// Enhanced validation schema
const patientSchema = z.object({
  firstName: z
    .string()
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .max(50, "Le prénom doit contenir moins de 50 caractères"),
  lastName: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(50, "Le nom doit contenir moins de 50 caractères"),
  dateOfBirth: z.string().min(1, "La date de naissance est requise"),
  gender: z.enum(["male", "female", "other"], { required_error: "Veuillez sélectionner un sexe" }),
  bloodType: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], {
    required_error: "Veuillez sélectionner un groupe sanguin",
  }),
  phone: z
    .string()
    .regex(/^\+?[\d\s\-()]+$/, "Veuillez entrer un numéro de téléphone valide")
    .min(10, "Le numéro de téléphone doit contenir au moins 10 chiffres"),
  email: z.string().email("Veuillez entrer une adresse e-mail valide").optional().or(z.literal("")),
  address: z.string().max(200, "L'adresse doit contenir moins de 200 caractères").optional(),
  emergencyContact: z.string().max(100, "Le nom du contact d'urgence doit contenir moins de 100 caractères").optional(),
  emergencyPhone: z
    .string()
    .regex(/^\+?[\d\s\-()]*$/, "Veuillez entrer un numéro de téléphone valide")
    .optional()
    .or(z.literal("")),
  weight: z
    .number()
    .min(30, "Le poids doit être d'au moins 30 kg")
    .max(300, "Le poids doit être inférieur à 300 kg")
    .optional(),
  height: z
    .number()
    .min(100, "La taille doit être d'au moins 100 cm")
    .max(250, "La taille doit être inférieure à 250 cm")
    .optional(),
  hemoglobinLevel: z
    .number()
    .min(5, "Le taux d'hémoglobine doit être d'au moins 5 g/dL")
    .max(20, "Le taux d'hémoglobine doit être inférieur à 20 g/dL")
    .optional(),
  medicalHistory: z.string().max(1000, "L'historique médical doit contenir moins de 1000 caractères").optional(),
})

interface PatientFormProps {
  patient?: any
  isEditing?: boolean
}

export function EnhancedPatientForm({ patient, isEditing = false }: PatientFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [admissionDate, setAdmissionDate] = useState<Date | undefined>(
    patient?.admissionDate ? new Date(patient.admissionDate) : undefined,
  )
  const [lastDonationDate, setLastDonationDate] = useState<Date | undefined>(
    patient?.lastDonationDate ? new Date(patient.lastDonationDate) : undefined,
  )

  const validateField = (name: string, value: any) => {
    try {
      const fieldSchema = patientSchema.shape[name as keyof typeof patientSchema.shape]
      if (fieldSchema) {
        fieldSchema.parse(value)
        setErrors((prev) => ({ ...prev, [name]: "" }))
        return true
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors((prev) => ({ ...prev, [name]: error.errors[0].message }))
        return false
      }
    }
    return true
  }

  const handleInputChange = (name: string, value: any) => {
    validateField(name, value)
  }

  async function onSubmit(formData: FormData) {
    setIsLoading(true)
    setErrors({})

    try {
      const patientData = {
        firstName: formData.get("firstName") as string,
        lastName: formData.get("lastName") as string,
        dateOfBirth: formData.get("dateOfBirth") as string,
        gender: formData.get("gender") as string,
        bloodType: formData.get("bloodType") as string,
        phone: formData.get("phone") as string,
        email: formData.get("email") as string,
        address: formData.get("address") as string,
        emergencyContact: formData.get("emergencyContact") as string,
        emergencyPhone: formData.get("emergencyPhone") as string,
        medicalHistory: formData.get("medicalHistory") as string,
        admissionDate: admissionDate?.toISOString(),
        lastDonationDate: lastDonationDate?.toISOString(),
        weight: formData.get("weight") ? Number.parseFloat(formData.get("weight") as string) : undefined,
        height: formData.get("height") ? Number.parseFloat(formData.get("height") as string) : undefined,
        hemoglobinLevel: formData.get("hemoglobinLevel")
          ? Number.parseFloat(formData.get("hemoglobinLevel") as string)
          : undefined,
      }

      // Validate all data
      const validationResult = patientSchema.safeParse(patientData)
      if (!validationResult.success) {
        const fieldErrors: Record<string, string> = {}
        validationResult.error.errors.forEach((error) => {
          if (error.path[0]) {
            fieldErrors[error.path[0] as string] = error.message
          }
        })
        setErrors(fieldErrors)
        toast({
          title: "Erreur de validation",
          description: "Veuillez corriger les erreurs dans le formulaire.",
          variant: "destructive",
        })
        return
      }

      if (isEditing && patient) {
        await updatePatient(patient._id, patientData)
        toast({
          title: "Patient mis à jour",
          description: "Les informations du patient ont été mises à jour avec succès.",
        })
      } else {
        await createPatient(patientData)
        toast({
          title: "Patient enregistré",
          description: "Le nouveau patient a été enregistré avec succès.",
        })
      }

      router.push("/patients")
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const FormField = ({
    label,
    name,
    children,
    required = false,
    description,
  }: {
    label: string
    name: string
    children: React.ReactNode
    required?: boolean
    description?: string
  }) => (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-sm font-medium text-gray-700 flex items-center">
        {label}{" "}
        {required && (
          <span className="text-red-500 ml-1" aria-label="requis">
            *
          </span>
        )}
      </Label>
      {children}
      {description && <p className="text-xs text-gray-500">{description}</p>}
      {errors[name] && (
        <div className="flex items-center space-x-1 text-red-600" role="alert">
          <AlertCircle className="h-3 w-3" />
          <span className="text-xs">{errors[name]}</span>
        </div>
      )}
    </div>
  )

  return (
    <form action={onSubmit} className="space-y-8 animate-fade-in">
      <Card className="border-gray-200 card-hover">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-gray-900">
            <User className="mr-2 h-5 w-5 text-red-600" />
            Informations personnelles
          </CardTitle>
          <CardDescription>Détails personnels et identification du patient</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Prénom" name="firstName" required>
              <Input
                id="firstName"
                name="firstName"
                defaultValue={patient?.firstName}
                required
                className={cn(
                  "border-gray-300 focus:border-red-500 focus:ring-red-500 focus-ring",
                  errors.firstName && "border-red-500",
                )}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                aria-describedby={errors.firstName ? "firstName-error" : undefined}
              />
            </FormField>
            <FormField label="Nom de famille" name="lastName" required>
              <Input
                id="lastName"
                name="lastName"
                defaultValue={patient?.lastName}
                required
                className={cn(
                  "border-gray-300 focus:border-red-500 focus:ring-red-500 focus-ring",
                  errors.lastName && "border-red-500",
                )}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                aria-describedby={errors.lastName ? "lastName-error" : undefined}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Date de naissance" name="dateOfBirth" required>
              <Input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                defaultValue={patient?.dateOfBirth}
                required
                className={cn(
                  "border-gray-300 focus:border-red-500 focus:ring-red-500 focus-ring",
                  errors.dateOfBirth && "border-red-500",
                )}
                onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                aria-describedby={errors.dateOfBirth ? "dateOfBirth-error" : undefined}
              />
            </FormField>
            <FormField label="Sexe" name="gender" required>
              <Select
                name="gender"
                defaultValue={patient?.gender}
                onValueChange={(value) => handleInputChange("gender", value)}
              >
                <SelectTrigger
                  className={cn(
                    "border-gray-300 focus:border-red-500 focus:ring-red-500 focus-ring",
                    errors.gender && "border-red-500",
                  )}
                >
                  <SelectValue placeholder="Sélectionner le sexe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Masculin</SelectItem>
                  <SelectItem value="female">Féminin</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-200 card-hover">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-gray-900">
            <Phone className="mr-2 h-5 w-5 text-blue-600" />
            Informations de contact
          </CardTitle>
          <CardDescription>Téléphone, e-mail et détails d'adresse</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Numéro de téléphone"
              name="phone"
              required
              description="Inclure l'indicatif pays si international"
            >
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={patient?.phone}
                required
                className={cn(
                  "border-gray-300 focus:border-red-500 focus:ring-red-500 focus-ring",
                  errors.phone && "border-red-500",
                )}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                aria-describedby={errors.phone ? "phone-error" : undefined}
              />
            </FormField>
            <FormField label="Adresse e-mail" name="email" description="Optionnel - pour les rappels de rendez-vous">
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={patient?.email}
                className={cn(
                  "border-gray-300 focus:border-red-500 focus:ring-red-500 focus-ring",
                  errors.email && "border-red-500",
                )}
                onChange={(e) => handleInputChange("email", e.target.value)}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
            </FormField>
          </div>

          <FormField label="Adresse" name="address">
            <Textarea
              id="address"
              name="address"
              defaultValue={patient?.address}
              rows={3}
              className={cn(
                "border-gray-300 focus:border-red-500 focus:ring-red-500 focus-ring",
                errors.address && "border-red-500",
              )}
              onChange={(e) => handleInputChange("address", e.target.value)}
              aria-describedby={errors.address ? "address-error" : undefined}
            />
          </FormField>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Nom du contact d'urgence" name="emergencyContact">
              <Input
                id="emergencyContact"
                name="emergencyContact"
                defaultValue={patient?.emergencyContact}
                className={cn(
                  "border-gray-300 focus:border-red-500 focus:ring-red-500 focus-ring",
                  errors.emergencyContact && "border-red-500",
                )}
                onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                aria-describedby={errors.emergencyContact ? "emergencyContact-error" : undefined}
              />
            </FormField>
            <FormField label="Téléphone du contact d'urgence" name="emergencyPhone">
              <Input
                id="emergencyPhone"
                name="emergencyPhone"
                type="tel"
                defaultValue={patient?.emergencyPhone}
                className={cn(
                  "border-gray-300 focus:border-red-500 focus:ring-red-500 focus-ring",
                  errors.emergencyPhone && "border-red-500",
                )}
                onChange={(e) => handleInputChange("emergencyPhone", e.target.value)}
                aria-describedby={errors.emergencyPhone ? "emergencyPhone-error" : undefined}
              />
            </FormField>
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-200 card-hover">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-gray-900">
            <Heart className="mr-2 h-5 w-5 text-red-600" />
            Informations médicales
          </CardTitle>
          <CardDescription>Groupe sanguin et détails médicaux</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="Groupe sanguin" name="bloodType" required>
              <Select
                name="bloodType"
                defaultValue={patient?.bloodType}
                onValueChange={(value) => handleInputChange("bloodType", value)}
              >
                <SelectTrigger
                  className={cn(
                    "border-gray-300 focus:border-red-500 focus:ring-red-500 focus-ring",
                    errors.bloodType && "border-red-500",
                  )}
                >
                  <SelectValue placeholder="Sélectionner le groupe sanguin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A+">A+ Positif</SelectItem>
                  <SelectItem value="A-">A- Négatif</SelectItem>
                  <SelectItem value="B+">B+ Positif</SelectItem>
                  <SelectItem value="B-">B- Négatif</SelectItem>
                  <SelectItem value="AB+">AB+ Positif</SelectItem>
                  <SelectItem value="AB-">AB- Négatif</SelectItem>
                  <SelectItem value="O+">O+ Positif</SelectItem>
                  <SelectItem value="O-">O- Négatif</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Poids (kg)" name="weight" description="Poids actuel du patient">
              <Input
                id="weight"
                name="weight"
                type="number"
                step="0.1"
                min="30"
                max="300"
                defaultValue={patient?.weight}
                className={cn(
                  "border-gray-300 focus:border-red-500 focus:ring-red-500 focus-ring",
                  errors.weight && "border-red-500",
                )}
                onChange={(e) =>
                  handleInputChange("weight", e.target.value ? Number.parseFloat(e.target.value) : undefined)
                }
                aria-describedby={errors.weight ? "weight-error" : undefined}
              />
            </FormField>
            <FormField label="Taille (cm)" name="height" description="Taille du patient">
              <Input
                id="height"
                name="height"
                type="number"
                step="0.1"
                min="100"
                max="250"
                defaultValue={patient?.height}
                className={cn(
                  "border-gray-300 focus:border-red-500 focus:ring-red-500 focus-ring",
                  errors.height && "border-red-500",
                )}
                onChange={(e) =>
                  handleInputChange("height", e.target.value ? Number.parseFloat(e.target.value) : undefined)
                }
                aria-describedby={errors.height ? "height-error" : undefined}
              />
            </FormField>
          </div>

          <FormField label="Taux d'hémoglobine (g/dL)" name="hemoglobinLevel" description="Taux d'hémoglobine actuel">
            <Input
              id="hemoglobinLevel"
              name="hemoglobinLevel"
              type="number"
              step="0.1"
              min="5"
              max="20"
              defaultValue={patient?.hemoglobinLevel}
              className={cn(
                "w-full md:w-1/3 border-gray-300 focus:border-red-500 focus:ring-red-500 focus-ring",
                errors.hemoglobinLevel && "border-red-500",
              )}
              onChange={(e) =>
                handleInputChange("hemoglobinLevel", e.target.value ? Number.parseFloat(e.target.value) : undefined)
              }
              aria-describedby={errors.hemoglobinLevel ? "hemoglobinLevel-error" : undefined}
            />
          </FormField>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Date d'admission" name="admissionDate">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal border-gray-300 hover:bg-gray-50 focus-ring",
                      !admissionDate && "text-muted-foreground",
                    )}
                    aria-label={
                      admissionDate
                        ? `Date d'admission: ${format(admissionDate, "PPP")}`
                        : "Sélectionner la date d'admission"
                    }
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {admissionDate ? format(admissionDate, "PPP") : "Sélectionner la date d'admission"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={admissionDate} onSelect={setAdmissionDate} initialFocus />
                </PopoverContent>
              </Popover>
            </FormField>
            <FormField label="Date du dernier don" name="lastDonationDate">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal border-gray-300 hover:bg-gray-50 focus-ring",
                      !lastDonationDate && "text-muted-foreground",
                    )}
                    aria-label={
                      lastDonationDate
                        ? `Date du dernier don: ${format(lastDonationDate, "PPP")}`
                        : "Sélectionner la date du dernier don"
                    }
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {lastDonationDate ? format(lastDonationDate, "PPP") : "Sélectionner la date du dernier don"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={lastDonationDate} onSelect={setLastDonationDate} initialFocus />
                </PopoverContent>
              </Popover>
            </FormField>
          </div>

          <FormField
            label="Historique médical et notes"
            name="medicalHistory"
            description="Saisir tout historique médical pertinent, allergies, médicaments ou notes spéciales"
          >
            <Textarea
              id="medicalHistory"
              name="medicalHistory"
              defaultValue={patient?.medicalHistory}
              rows={4}
              placeholder="Saisir tout historique médical pertinent, allergies, médicaments ou notes spéciales..."
              className={cn(
                "border-gray-300 focus:border-red-500 focus:ring-red-500 focus-ring",
                errors.medicalHistory && "border-red-500",
              )}
              onChange={(e) => handleInputChange("medicalHistory", e.target.value)}
              aria-describedby={errors.medicalHistory ? "medicalHistory-error" : undefined}
            />
          </FormField>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4 pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="border-gray-300 focus-ring"
          disabled={isLoading}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-red-600 hover:bg-red-700 focus-ring"
          aria-describedby="submit-button-description"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Enregistrement...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {isEditing ? "Mettre à jour le patient" : "Enregistrer le patient"}
            </>
          )}
        </Button>
        <div id="submit-button-description" className="sr-only">
          {isEditing ? "Mettre à jour les informations du patient" : "Enregistrer un nouveau patient dans le système"}
        </div>
      </div>
    </form>
  )
}

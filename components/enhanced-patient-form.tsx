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
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters"),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be less than 50 characters"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["male", "female", "other"], { required_error: "Please select a gender" }),
  bloodType: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], {
    required_error: "Please select a blood type",
  }),
  phone: z
    .string()
    .regex(/^\+?[\d\s\-$$$$]+$/, "Please enter a valid phone number")
    .min(10, "Phone number must be at least 10 digits"),
  email: z.string().email("Please enter a valid email address").optional().or(z.literal("")),
  address: z.string().max(200, "Address must be less than 200 characters").optional(),
  emergencyContact: z.string().max(100, "Emergency contact name must be less than 100 characters").optional(),
  emergencyPhone: z
    .string()
    .regex(/^\+?[\d\s\-$$$$]*$/, "Please enter a valid phone number")
    .optional()
    .or(z.literal("")),
  weight: z.number().min(30, "Weight must be at least 30 kg").max(300, "Weight must be less than 300 kg").optional(),
  height: z.number().min(100, "Height must be at least 100 cm").max(250, "Height must be less than 250 cm").optional(),
  hemoglobinLevel: z
    .number()
    .min(5, "Hemoglobin level must be at least 5 g/dL")
    .max(20, "Hemoglobin level must be less than 20 g/dL")
    .optional(),
  medicalHistory: z.string().max(1000, "Medical history must be less than 1000 characters").optional(),
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
          title: "Validation Error",
          description: "Please correct the errors in the form.",
          variant: "destructive",
        })
        return
      }

      if (isEditing && patient) {
        await updatePatient(patient._id, patientData)
        toast({
          title: "Patient Updated",
          description: "Patient information has been successfully updated.",
        })
      } else {
        await createPatient(patientData)
        toast({
          title: "Patient Registered",
          description: "New patient has been successfully registered.",
        })
      }

      router.push("/patients")
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
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
          <span className="text-red-500 ml-1" aria-label="required">
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
      {/* Personal Information */}
      <Card className="border-gray-200 card-hover">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-gray-900">
            <User className="mr-2 h-5 w-5 text-red-600" />
            Personal Information
          </CardTitle>
          <CardDescription>Basic patient details and identification</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="First Name" name="firstName" required>
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
            <FormField label="Last Name" name="lastName" required>
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
            <FormField label="Date of Birth" name="dateOfBirth" required>
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
            <FormField label="Gender" name="gender" required>
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
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card className="border-gray-200 card-hover">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-gray-900">
            <Phone className="mr-2 h-5 w-5 text-blue-600" />
            Contact Information
          </CardTitle>
          <CardDescription>Phone, email, and address details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Phone Number" name="phone" required description="Include country code if international">
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
            <FormField label="Email Address" name="email" description="Optional - for appointment reminders">
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

          <FormField label="Address" name="address">
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
            <FormField label="Emergency Contact Name" name="emergencyContact">
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
            <FormField label="Emergency Contact Phone" name="emergencyPhone">
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

      {/* Medical Information */}
      <Card className="border-gray-200 card-hover">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-gray-900">
            <Heart className="mr-2 h-5 w-5 text-red-600" />
            Medical Information
          </CardTitle>
          <CardDescription>Blood type and medical details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="Blood Type" name="bloodType" required>
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
                  <SelectValue placeholder="Select blood type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A+">A+ Positive</SelectItem>
                  <SelectItem value="A-">A- Negative</SelectItem>
                  <SelectItem value="B+">B+ Positive</SelectItem>
                  <SelectItem value="B-">B- Negative</SelectItem>
                  <SelectItem value="AB+">AB+ Positive</SelectItem>
                  <SelectItem value="AB-">AB- Negative</SelectItem>
                  <SelectItem value="O+">O+ Positive</SelectItem>
                  <SelectItem value="O-">O- Negative</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Weight (kg)" name="weight" description="Patient's current weight">
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
            <FormField label="Height (cm)" name="height" description="Patient's height">
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

          <FormField label="Hemoglobin Level (g/dL)" name="hemoglobinLevel" description="Current hemoglobin level">
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
            <FormField label="Admission Date" name="admissionDate">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal border-gray-300 hover:bg-gray-50 focus-ring",
                      !admissionDate && "text-muted-foreground",
                    )}
                    aria-label={
                      admissionDate ? `Admission date: ${format(admissionDate, "PPP")}` : "Select admission date"
                    }
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {admissionDate ? format(admissionDate, "PPP") : "Select admission date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={admissionDate} onSelect={setAdmissionDate} initialFocus />
                </PopoverContent>
              </Popover>
            </FormField>
            <FormField label="Last Donation Date" name="lastDonationDate">
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
                        ? `Last donation date: ${format(lastDonationDate, "PPP")}`
                        : "Select last donation date"
                    }
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {lastDonationDate ? format(lastDonationDate, "PPP") : "Select last donation date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={lastDonationDate} onSelect={setLastDonationDate} initialFocus />
                </PopoverContent>
              </Popover>
            </FormField>
          </div>

          <FormField
            label="Medical History & Notes"
            name="medicalHistory"
            description="Enter any relevant medical history, allergies, medications, or special notes"
          >
            <Textarea
              id="medicalHistory"
              name="medicalHistory"
              defaultValue={patient?.medicalHistory}
              rows={4}
              placeholder="Enter any relevant medical history, allergies, medications, or special notes..."
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
          Cancel
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
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {isEditing ? "Update Patient" : "Register Patient"}
            </>
          )}
        </Button>
        <div id="submit-button-description" className="sr-only">
          {isEditing ? "Update the patient's information" : "Register a new patient in the system"}
        </div>
      </div>
    </form>
  )
}

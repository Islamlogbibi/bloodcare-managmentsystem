import { z } from "zod"

export const createPatientSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  dateOfBirth: z.string().min(1),
  gender: z.enum(["male", "female"]),
  bloodType: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]),
  phone: z
    .string()
    .regex(/^\+?[\d\s\-()]+$/)
    .min(10),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().max(200).optional(),
  emergencyContact: z.string().max(100).optional(),
  emergencyPhone: z
    .string()
    .regex(/^\+?[\d\s\-()]*$/)
    .optional()
    .or(z.literal("")),
  weight: z.number().min(30).max(300).optional(),
  height: z.number().min(100).max(250).optional(),
  hemoglobinLevel: z.number().min(5).max(20).optional(),
  medicalHistory: z.string().max(1000).optional(),
  admissionDate: z.string().optional(),
  lastDonationDate: z.string().optional(),
  // New fields
  hasF: z.boolean().optional().default(false),
  hasC: z.boolean().optional().default(false),
  hasL: z.boolean().optional().default(false),
  patientCategory: z
    .enum(["All Patients", "HyperRegime", "PolyTransfuses", "Echanges", "PDV", "Echanges Occasionnels"])
    .optional()
    .default("All Patients"),
})

export const updatePatientSchema = createPatientSchema.partial()

export const patientQuerySchema = z.object({
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("10"),
  search: z.string().optional(),
  bloodType: z.string().optional(),
  status: z.string().optional(),
  category: z.string().optional(),
  sortBy: z.string().optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
})

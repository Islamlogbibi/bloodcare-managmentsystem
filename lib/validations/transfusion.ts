import { z } from "zod"

export const createTransfusionSchema = z.object({
  patientId: z.string().min(1),
  scheduledDate: z.string().min(1),
  scheduledTime: z.string().min(1),
  priority: z.enum(["regular", "urgent"]),
  bloodUnits: z.number().min(1).max(10),
  notes: z.string().max(500).optional(),
  bloodType: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]).optional(),
  crossMatchRequired: z.boolean().optional().default(false),
  preTransfusionTests: z.array(z.string()).optional(),
})

export const updateTransfusionSchema = createTransfusionSchema.partial()

export const transfusionQuerySchema = z.object({
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("10"),
  date: z.string().optional(),
  priority: z.string().optional(),
  status: z.string().optional(),
  patientId: z.string().optional(),
})

import { ObjectId } from "mongodb"
import { getDatabase } from "../mongodb"
import type { createTransfusionSchema, updateTransfusionSchema } from "../validations/transfusion"
import type { z } from "zod"

export type CreateTransfusionInput = z.infer<typeof createTransfusionSchema>
export type UpdateTransfusionInput = z.infer<typeof updateTransfusionSchema>

export class TransfusionService {
  private async getCollection() {
    const db = await getDatabase()
    return db.collection("transfusions")
  }

  private async getPatientsCollection() {
    const db = await getDatabase()
    return db.collection("patients")
  }

  async createTransfusion(data: CreateTransfusionInput) {
    const collection = await this.getCollection()

    const transfusion = {
      ...data,
      transfusionId: `TRN${Date.now().toString().slice(-6)}`,
      status: "scheduled",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await collection.insertOne(transfusion)
    return { ...transfusion, _id: result.insertedId }
  }

  async getTransfusions(
    filters: {
      page?: number
      limit?: number
      date?: string
      priority?: string
      status?: string
      patientId?: string
    } = {},
  ) {
    const collection = await this.getCollection()
    const patientsCollection = await this.getPatientsCollection()

    const { page = 1, limit = 10, date, priority, status, patientId } = filters

    // Build query
    const query: any = {}

    if (date) {
      const targetDate = new Date(date)
      const nextDay = new Date(targetDate)
      nextDay.setDate(nextDay.getDate() + 1)
      query.scheduledDate = { $gte: targetDate, $lt: nextDay }
    }

    if (priority) {
      query.priority = priority
    }

    if (status) {
      query.status = status
    }

    if (patientId) {
      query.patientId = new ObjectId(patientId)
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Execute query with patient population
    const transfusions = await collection.find(query).sort({ scheduledTime: 1 }).skip(skip).limit(limit).toArray()

    // Populate patient data
    const populatedTransfusions = await Promise.all(
      transfusions.map(async (transfusion) => {
        const patient = await patientsCollection.findOne({
          _id: new ObjectId(transfusion.patientId),
        })

        return {
          ...transfusion,
          _id: transfusion._id.toString(),
          patient: patient
            ? {
                ...patient,
                _id: patient._id.toString(),
              }
            : null,
        }
      }),
    )

    const total = await collection.countDocuments(query)

    return {
      transfusions: populatedTransfusions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  }

  async getTodayTransfusions() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return this.getTransfusions({
      date: today.toISOString(),
      limit: 100,
    })
  }

  async getTomorrowTransfusions() {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)

    return this.getTransfusions({
      date: tomorrow.toISOString(),
      limit: 100,
    })
  }

  async getTransfusionById(id: string) {
    const collection = await this.getCollection()
    const patientsCollection = await this.getPatientsCollection()

    const transfusion = await collection.findOne({ _id: new ObjectId(id) })

    if (!transfusion) {
      return null
    }

    const patient = await patientsCollection.findOne({
      _id: new ObjectId(transfusion.patientId),
    })

    return {
      ...transfusion,
      _id: transfusion._id.toString(),
      patient: patient
        ? {
            ...patient,
            _id: patient._id.toString(),
          }
        : null,
    }
  }

  async updateTransfusion(id: string, data: UpdateTransfusionInput) {
    const collection = await this.getCollection()

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...data,
          updatedAt: new Date(),
        },
      },
    )

    return result
  }

  async updateTransfusionStatus(id: string, status: string, notes?: string) {
    const collection = await this.getCollection()

    const updateData: any = {
      status,
      updatedAt: new Date(),
    }

    if (status === "in-progress") {
      updateData.startedAt = new Date()
    } else if (status === "completed") {
      updateData.completedAt = new Date()
    }

    if (notes) {
      updateData.statusNotes = notes
    }

    const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: updateData })

    return result
  }

  async cancelTransfusion(id: string, reason: string) {
    const collection = await this.getCollection()

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: "cancelled",
          cancellationReason: reason,
          cancelledAt: new Date(),
          updatedAt: new Date(),
        },
      },
    )

    return result
  }

  async getTransfusionStats() {
    const collection = await this.getCollection()

    const stats = await collection
      .aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            completed: {
              $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
            },
            scheduled: {
              $sum: { $cond: [{ $eq: ["$status", "scheduled"] }, 1, 0] },
            },
            inProgress: {
              $sum: { $cond: [{ $eq: ["$status", "in-progress"] }, 1, 0] },
            },
            cancelled: {
              $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
            },
            urgent: {
              $sum: { $cond: [{ $eq: ["$priority", "urgent"] }, 1, 0] },
            },
          },
        },
      ])
      .toArray()

    return (
      stats[0] || {
        total: 0,
        completed: 0,
        scheduled: 0,
        inProgress: 0,
        cancelled: 0,
        urgent: 0,
      }
    )
  }
}

export const transfusionService = new TransfusionService()

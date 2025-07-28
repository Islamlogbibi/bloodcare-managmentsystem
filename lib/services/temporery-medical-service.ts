import { getDatabase } from "../mongodb"
import type { temporaryMedicalDataSchema } from "../validations/patient"
import type { z } from "zod"

export type TemporaryMedicalData = z.infer<typeof temporaryMedicalDataSchema>

export class TemporaryMedicalService {
  private async getCollection() {
    const db = await getDatabase()
    return db.collection("temporary_medical_data")
  }

  async saveTemporaryData(data: Omit<TemporaryMedicalData, "createdAt" | "expiresAt">) {
    const collection = await this.getCollection()

    const now = new Date()
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000) // 24 hours from now

    const temporaryData = {
      ...data,
      createdAt: now,
      expiresAt: expiresAt,
    }

    // Remove any existing temporary data for this patient on this session date
    await collection.deleteMany({
      patientId: data.patientId,
      sessionDate: data.sessionDate,
    })

    const result = await collection.insertOne(temporaryData)
    return { ...temporaryData, _id: result.insertedId }
  }

  async getTemporaryData(patientId: string, sessionDate: string) {
    const collection = await this.getCollection()

    // Clean up expired data first
    await this.cleanupExpiredData()

    const data = await collection.findOne({
      patientId,
      sessionDate,
      expiresAt: { $gt: new Date() }, // Only get non-expired data
    })

    return data
      ? {
          ...data,
          _id: data._id.toString(),
        }
      : null
  }

  async cleanupExpiredData() {
    const collection = await this.getCollection()

    // Remove all expired temporary data
    await collection.deleteMany({
      expiresAt: { $lt: new Date() },
    })
  }

  async deleteTemporaryData(patientId: string, sessionDate: string) {
    const collection = await this.getCollection()

    const result = await collection.deleteMany({
      patientId,
      sessionDate,
    })

    return result
  }

  // Get all temporary data for a patient (for debugging/admin purposes)
  async getAllTemporaryDataForPatient(patientId: string) {
    const collection = await this.getCollection()

    const data = await collection
      .find({
        patientId,
        expiresAt: { $gt: new Date() },
      })
      .sort({ createdAt: -1 })
      .toArray()

    return data.map((item) => ({
      ...item,
      _id: item._id.toString(),
    }))
  }
}

export const temporaryMedicalService = new TemporaryMedicalService()

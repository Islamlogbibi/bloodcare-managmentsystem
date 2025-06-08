import { ObjectId } from "mongodb"
import { getDatabase } from "../mongodb"
import type { createPatientSchema, updatePatientSchema } from "../validations/patient"
import type { z } from "zod"

export type CreatePatientInput = z.infer<typeof createPatientSchema>
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>

export class PatientService {
  private async getCollection() {
    const db = await getDatabase()
    return db.collection("patients")
  }

  async createPatient(data: CreatePatientInput) {
    const collection = await this.getCollection()

    const patient = {
      ...data,
      patientId: `PAT${Date.now().toString().slice(-6)}`,
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await collection.insertOne(patient)
    return { ...patient, _id: result.insertedId }
  }

  async getPatients(
    filters: {
      page?: number
      limit?: number
      search?: string
      bloodType?: string
      status?: string
      gender?: string
      patientCategory?: string
      sortBy?: string
      sortOrder?: "asc" | "desc"
    } = {},
  ) {
    const collection = await this.getCollection()
    const {
      page = 1,
      limit = 50,
      search,
      bloodType,
      status = "active",
      gender,
      patientCategory,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = filters

    // Build query
    const query: any = { status: { $ne: "deleted" } }

    if (status && status !== "all") {
      query.status = status
    }

    if (bloodType && bloodType !== "all") {
      query.bloodType = bloodType
    }

    if (gender && gender !== "all") {
      query.gender = gender
    }

    if (patientCategory && patientCategory !== "All Patients") {
      query.patientCategory = patientCategory
    }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { patientId: { $regex: search, $options: "i" } },
      ]
    }

    // Calculate pagination
    const skip = (page - 1) * limit
    const sortDirection = sortOrder === "asc" ? 1 : -1

    // Execute queries
    const [patients, total] = await Promise.all([
      collection
        .find(query)
        .sort({ [sortBy]: sortDirection })
        .skip(skip)
        .limit(limit)
        .toArray(),
      collection.countDocuments(query),
    ])

    return patients.map((patient) => ({
      ...patient,
      _id: patient._id.toString(),
    }))
  }

  async getPatientById(id: string) {
    const collection = await this.getCollection()
    const patient = await collection.findOne({ _id: new ObjectId(id) })

    if (!patient) {
      return null
    }

    return {
      ...patient,
      _id: patient._id.toString(),
    }
  }

  async updatePatient(id: string, data: UpdatePatientInput) {
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

  async deletePatient(id: string) {
    const collection = await this.getCollection()

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: "deleted",
          deletedAt: new Date(),
          updatedAt: new Date(),
        },
      },
    )

    return result
  }

  async getPatientStats() {
    const collection = await this.getCollection()
    const transfusionsCollection = (await getDatabase()).collection("transfusions")

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dayAfter = new Date(tomorrow)
    dayAfter.setDate(dayAfter.getDate() + 1)

    try {
      const [totalPatients, todayTransfusions, tomorrowTransfusions, urgentCases] = await Promise.all([
        collection.countDocuments({ status: "active" }),
        transfusionsCollection.countDocuments({
          scheduledDate: { $gte: today, $lt: tomorrow },
          status: { $ne: "cancelled" },
        }),
        transfusionsCollection.countDocuments({
          scheduledDate: { $gte: tomorrow, $lt: dayAfter },
          status: { $ne: "cancelled" },
        }),
        transfusionsCollection.countDocuments({
          priority: "urgent",
          status: { $in: ["scheduled", "in-progress"] },
        }),
      ])

      return {
        totalPatients,
        todayTransfusions,
        tomorrowTransfusions,
        urgentCases,
      }
    } catch (error) {
      console.error("Error in getPatientStats:", error)
      return {
        totalPatients: 0,
        todayTransfusions: 0,
        tomorrowTransfusions: 0,
        urgentCases: 0,
      }
    }
  }

  async getBloodTypeDistribution() {
    const collection = await this.getCollection()

    const distribution = await collection
      .aggregate([
        { $match: { status: "active" } },
        { $group: { _id: "$bloodType", count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ])
      .toArray()

    return distribution
  }

  async getCategoryStats() {
    const collection = await this.getCollection()

    const stats = await collection
      .aggregate([
        { $match: { status: "active" } },
        { $group: { _id: "$patientCategory", count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ])
      .toArray()

    return stats
  }
}

export const patientService = new PatientService()

"use server"

import { MongoClient, ObjectId } from "mongodb"
import { revalidatePath } from "next/cache"

const client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017")
const dbName = "blood_donation_system"

async function connectToDatabase() {
  try {
    await client.connect()
    return client.db(dbName)
  } catch (error) {
    console.error("Database connection error:", error)
    throw new Error("Failed to connect to database")
  }
}

export async function deleteTransfusionById(id: string) {
  const db = await connectToDatabase()
  const result = await db.collection("transfusions").deleteOne({ _id: new ObjectId(id) })
  return result.deletedCount
}

export async function getPatientsByDate(date: string) {
  try {
    await client.connect()
    const db = client.db(dbName)
    const collection = db.collection("dailyHistory")

    const day = await collection.findOne({ date })

    return day?.patients || []
  } catch (error) {
    console.error("Failed to fetch patients for date:", error)
    return []
  }
}

export async function getDailyHistory() {
  const db = await connectToDatabase()
  const data = await db.collection("daily_history").find().toArray()

  return data.map(entry => ({
    ...entry,
    date: new Date(entry.date).toISOString().split("T")[0] 
  }))
}



export async function createPatient(patientData: any) {
  try {
    const db = await connectToDatabase()
    const collection = db.collection("patients")

    const patient = {
      ...patientData,
      patientId: `PAT${Date.now().toString().slice(-6)}`,
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await collection.insertOne(patient)
    revalidatePath("/patients")

    return {
      success: true,
      patient: { ...patient, _id: result.insertedId.toString() },
    }
  } catch (error) {
    console.error("Error creating patient:", error)
    throw new Error("Failed to create patient")
  }
}

export async function getPatients(filters?: any) {
  try {
    const db = await connectToDatabase()
    const collection = db.collection("patients")

    // Build query
    const query: any = { status: { $ne: "deleted" } }

    if (filters?.search) {
      query.$or = [
        { firstName: { $regex: filters.search, $options: "i" } },
        { lastName: { $regex: filters.search, $options: "i" } },
        { phone: { $regex: filters.search, $options: "i" } },
        { email: { $regex: filters.search, $options: "i" } },
        { patientId: { $regex: filters.search, $options: "i" } },
      ]
    }

    if (filters?.bloodType && filters.bloodType !== "all") {
      query.bloodType = filters.bloodType
    }

    if (filters?.ph && filters.ph !== "all") {
      query.ph = filters.ph
    }

    if (filters?.patientCategory && filters.patientCategory !== "All Patients") {
      query.patientCategory = filters.patientCategory
    }

    const patients = await collection.find(query).sort({ createdAt: -1 }).toArray()

    return patients.map((patient) => ({
      ...patient,
      _id: patient._id.toString(),
    }))
  } catch (error) {
    console.error("Error fetching patients:", error)
    return []
  }
}

export async function getPatientById(id: string) {
  try {
    if (!ObjectId.isValid(id)) {
      throw new Error("Invalid patient ID")
    }

    const db = await connectToDatabase()
    const collection = db.collection("patients")

    const patient = await collection.findOne({ _id: new ObjectId(id) })

    if (!patient) {
      return null
    }

    return {
      ...patient,
      _id: patient._id.toString(),
      schedules: patient.schedules ?? [],
    }
  } catch (error) {
    console.error("Error fetching patient by ID:", error)
    return null
  }
}

export async function updatePatient(id: string, patientData: any) {
  try {
    if (!ObjectId.isValid(id)) {
      throw new Error("Invalid patient ID")
    }

    const db = await connectToDatabase()
    const collection = db.collection("patients")

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...patientData,
          updatedAt: new Date(),
        },
      },
    )

    revalidatePath("/patients")
    return { success: true, result }
  } catch (error) {
    console.error("Error updating patient:", error)
    throw new Error("Failed to update patient")
  }
}

export async function deletePatient(id: string) {
  try {
    console.log("Server action deletePatient called with ID:", id)

    if (!ObjectId.isValid(id)) {
      throw new Error("Invalid patient ID")
    }

    const db = await connectToDatabase()
    const collection = db.collection("patients")

    // Use soft delete - mark as deleted instead of removing
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

    console.log("Delete operation result:", result)

    if (result.matchedCount === 0) {
      throw new Error("Patient not found")
    }

    revalidatePath("/patients")
    return { success: true, result }
  } catch (error) {
    console.error("Error deleting patient:", error)
    throw new Error("Failed to delete patient")
  }
}

export async function addToDailyHistory(transfusion: any, patient: any) {
  try {
    const db = await connectToDatabase()
    const collection = db.collection("dailyHistory")

    const date = new Date()
    date.setHours(0, 0, 0, 0)
    const isoDate = date.toISOString().split("T")[0]

    const patientEntry = {
      date: new Date(),
      priority: patient.priority || "regular",
      bloodType: patient.bloodType,
      ph: patient.ph,
      hb: patient.hb,
      poches: patient.poches,
      hasF: patient.hasF,
      hasC: patient.hasC,
      hasL: patient.hasL,
      don: patient.don,
      Hdist: patient.Hdist,
      Hrecu: patient.Hrecu,
      time: new Date(transfusion.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    await collection.updateOne(
      { date: isoDate },
      { $push: { patients: patientEntry }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true }
    )

    revalidatePath("/history/days")
    return { success: true }
  } catch (error) {
    console.error("Error adding to daily history:", error)
    throw new Error("Failed to add to daily history")
  }
}

export async function scheduleTransfusion(transfusionData: any) {
  try {
    const db = await connectToDatabase()
    const transfusionsCollection = db.collection("transfusions")
    // Ensure patientId is an ObjectId
    const patientId =
      typeof transfusionData.patientId === "string"
        ? new ObjectId(transfusionData.patientId)
        : transfusionData.patientId

    // Parse the scheduled date and time
    const scheduledDate = new Date(transfusionData.scheduledDate)
    const [hours, minutes] = transfusionData.scheduledTime.split(":")
    const scheduledTime = new Date(scheduledDate)
    scheduledTime.setHours(Number.parseInt(hours), Number.parseInt(minutes), 0, 0)

    const transfusion = {
      patientId,
      scheduledDate,
      scheduledTime,
      priority: transfusionData.priority,
      bloodUnits: transfusionData.bloodUnits || 0,
      notes: transfusionData.notes || "",
      transfusionId: `TRN${Date.now().toString().slice(-6)}`,
      status: "scheduled",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Insert the transfusion
    const result = await transfusionsCollection.insertOne(transfusion)

    // Update the patient's last donation date
    const patient = await db.collection("patients").findOne({ _id: new ObjectId(patientId) })

    if (!patient) {
      throw new Error("Patient not found")
    }
    // Store in dailyHistory collection
    const dailyHistoryCollection = db.collection("daily_history")

    const dayDate = new Date()
    dayDate.setHours(0, 0, 0, 0)
    const isoDay = dayDate.toISOString().split("T")[0]

    await dailyHistoryCollection.updateOne(
      { date: isoDay },
      {
        $push: { 
          patients : {
            fullname: patient.firstName + " " + patient.lastName,
            priority: patient.priority || "regular",
            bloodType: patient.bloodType,
            ph: patient.ph,
            hb: patient.hb,
            poches: patient.poches,
            hasF: patient.hasF,
            hasC: patient.hasC,
            hasL: patient.hasL,
            don: patient.don,
            Hdist: patient.Hdist,
            Hrecu: patient.Hrecu,
            time: transfusion.scheduledTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          }
          
         },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true }
    )



    revalidatePath("/transfusions/today")
    revalidatePath("/transfusions/tomorrow")
    revalidatePath("/patients")

    return { success: true, result }
  } catch (error) {
    console.error("Error scheduling transfusion:", error)
    throw new Error("Failed to schedule transfusion")
  }
}
export async function updatehbf({ patientId, date, hbf }: { patientId: string; date: string; hbf: float }) {
  const db = await connectToDatabase();

  const objectId = typeof patientId === "string" ? new ObjectId(patientId) : patientId;

  // Convert YYYY-MM-DD to date range for comparison
  const targetDate = new Date(date);

  const result = await db.collection("patients").updateOne(
    {
      _id: objectId,
      "schedules.date": {
        $gte: new Date(targetDate.setHours(0, 0, 0, 0)),
        $lt: new Date(targetDate.setHours(23, 59, 59, 999)),
      },
    },
    {
      $set: { "schedules.$.hbf": hbf },
    }
  );

  if (result.modifiedCount === 0) {
    throw new Error("No matching schedule found for that date");
  }

  return result;
}


export async function updatehistory(transfusionData: any) {
  const db = await connectToDatabase()
  // Ensure patientId is an ObjectId
  const patientId =
    typeof transfusionData.patientId === "string"
      ? new ObjectId(transfusionData.patientId)
      : transfusionData.patientId
  const patient = await db.collection("patients").findOne({ _id: new ObjectId(patientId) })

  if (!patient) {
    throw new Error("Patient not found")
  }
  await db.collection("patients").updateOne(
    { _id: new ObjectId(patientId) },
    {
      
      $push: {
        schedules: {
          date: new Date(),
          priority: patient.priority || "regular",
          bloodType: patient.bloodType,
          ph: patient.ph,
          hb: patient.hb,
          poches: patient.poches,
          hasF: patient.hasF,
          hasC: patient.hasC,
          hasL: patient.hasL,
          don: patient.don,
          Hdist: patient.Hdist,
          Hrecu: patient.Hrecu,
        },
      },
    }
  )
}
export async function updateTransfusionStatus(transfusionId: string, status: string) {
  try {
    if (!ObjectId.isValid(transfusionId)) {
      throw new Error("Invalid transfusion ID")
    }

    const db = await connectToDatabase()
    const collection = db.collection("transfusions")

    const result = await collection.updateOne(
      { _id: new ObjectId(transfusionId) },
      {
        $set: {
          status,
          completedAt: status === "completed" ? new Date() : null,
          updatedAt: new Date(),
        },
      },
    )

    revalidatePath("/transfusions/today")
    revalidatePath("/transfusions/tomorrow")
    return { success: true, result }
  } catch (error) {
    console.error("Error updating transfusion status:", error)
    throw new Error("Failed to update transfusion status")
  }
}

export async function getTodayTransfusions() {
  try {
    const db = await connectToDatabase()
    const transfusionsCollection = db.collection("transfusions")
    const patientsCollection = db.collection("patients")

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const transfusions = await transfusionsCollection
      .find({
        scheduledDate: {
          $gte: today,
          $lt: tomorrow,
        },
        status: { $ne: "cancelled" },
      })
      .sort({ scheduledTime: 1 })
      .toArray()

    const populatedTransfusions = await Promise.all(
      transfusions.map(async (transfusion) => {
        const patient = await patientsCollection.findOne({
          _id: transfusion.patientId,
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

    return populatedTransfusions
  } catch (error) {
    console.error("Error fetching today's transfusions:", error)
    return []
  }
}

export async function getTomorrowTransfusions() {
  try {
    const db = await connectToDatabase()
    const transfusionsCollection = db.collection("transfusions")
    const patientsCollection = db.collection("patients")

    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    const dayAfter = new Date(tomorrow)
    dayAfter.setDate(dayAfter.getDate() + 1)

    const transfusions = await transfusionsCollection
      .find({
        scheduledDate: {
          $gte: tomorrow,
          $lt: dayAfter,
        },
        status: { $ne: "cancelled" },
      })
      .sort({ scheduledTime: 1 })
      .toArray()

    const populatedTransfusions = await Promise.all(
      transfusions.map(async (transfusion) => {
        const patient = await patientsCollection.findOne({
          _id: transfusion.patientId,
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

    return populatedTransfusions
  } catch (error) {
    console.error("Error fetching tomorrow's transfusions:", error)
    return []
  }
}

export async function getPatientStats() {
  try {
    const db = await connectToDatabase()
    const patientsCollection = db.collection("patients")
    const transfusionsCollection = db.collection("transfusions")

    const totalPatients = await patientsCollection.countDocuments({ status: "active" })

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dayAfter = new Date(tomorrow)
    dayAfter.setDate(dayAfter.getDate() + 1)

    const todayTransfusions = await transfusionsCollection.countDocuments({
      scheduledDate: { $gte: today, $lt: tomorrow },
      status: { $ne: "cancelled" },
    })

    const tomorrowTransfusions = await transfusionsCollection.countDocuments({
      scheduledDate: { $gte: tomorrow, $lt: dayAfter },
      status: { $ne: "cancelled" },
    })

    const urgentCases = await transfusionsCollection.countDocuments({
      priority: "urgent",
      status: { $in: ["scheduled", "in-progress"] },
    })

    return {
      totalPatients,
      todayTransfusions,
      tomorrowTransfusions,
      urgentCases,
    }
  } catch (error) {
    console.error("Error fetching patient stats:", error)
    return {
      totalPatients: 0,
      todayTransfusions: 0,
      tomorrowTransfusions: 0,
      urgentCases: 0,
    }
  }
}

export async function getAnalyticsStats() {
  try {
    const db = await connectToDatabase()
    const patientsCollection = db.collection("patients")
    const transfusionsCollection = db.collection("transfusions")

    const totalTransfusions = await transfusionsCollection.countDocuments()
    const successRate = 98.5 // This would be calculated based on completed vs total transfusions
    const avgWaitTime = 12 // This would be calculated from actual wait times
    const criticalCases = await transfusionsCollection.countDocuments({
      priority: "urgent",
      status: { $in: ["scheduled", "in-progress"] },
    })

    return {
      totalTransfusions,
      successRate,
      avgWaitTime,
      criticalCases,
    }
  } catch (error) {
    console.error("Error fetching analytics stats:", error)
    return {
      totalTransfusions: 0,
      successRate: 0,
      avgWaitTime: 0,
      criticalCases: 0,
    }
  }
}

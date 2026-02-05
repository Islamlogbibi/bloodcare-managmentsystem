import { type NextRequest, NextResponse } from "next/server"
import { MongoClient } from "mongodb"

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const db = await connectToDatabase()
    const transfusionsCollection = db.collection("transfusions")
    const patientsCollection = db.collection("patients")

    // Build date filter
    const dateFilter: any = {}
    if (startDate && endDate) {
      dateFilter.scheduledDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      }
    }

    const dailyTransfusions = await transfusionsCollection
      .aggregate([
        { $match: dateFilter },
        {
          $lookup: {
            from: "patients",
            localField: "patientId",
            foreignField: "_id",
            as: "patient",
          },
        },
        { $unwind: { path: "$patient", preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$scheduledDate" } },
            transfusions: { $sum: 1 },
            completed: {
              $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
            },
            totalBloodUnits: {
              $sum: { $ifNull: ["$patient.poches", 0] },
            },
          },
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            date: "$_id",
            transfusions: 1,
            completed: 1,
            bloodUnits: "$totalBloodUnits",
            _id: 0,
          },
        },
      ])
      .toArray()

    const bloodTypeDistribution = await patientsCollection
      .aggregate([
        { $match: { status: "active" } },
        {
          $group: {
            _id: "$bloodType",
            count: { $sum: 1 },
            totalBloodUnits: { $sum: { $ifNull: ["$poches", 0] } },
            avgHemoglobin: { $avg: { $ifNull: ["$hb", 0] } },
          },
        },
        {
          $project: {
            bloodType: "$_id",
            count: 1,
            totalBloodUnits: 1,
            avgHemoglobin: { $round: ["$avgHemoglobin", 1] },
            _id: 0,
          },
        },
        { $sort: { count: -1 } },
      ])
      .toArray()

    // Calculate percentages for blood types
    const totalPatients = bloodTypeDistribution.reduce((sum, item) => sum + item.count, 0)
    const bloodTypeWithPercentages = bloodTypeDistribution.map((item) => ({
      ...item,
      percentage: totalPatients > 0 ? Math.round((item.count / totalPatients) * 100) : 0,
    }))

    const priorityDistribution = await transfusionsCollection
      .aggregate([
        { $match: dateFilter },
        {
          $lookup: {
            from: "patients",
            localField: "patientId",
            foreignField: "_id",
            as: "patient",
          },
        },
        { $unwind: { path: "$patient", preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: "$priority",
            count: { $sum: 1 },
            totalBloodUnits: { $sum: { $ifNull: ["$patient.poches", 0] } },
          },
        },
        {
          $project: {
            priority: { $ifNull: ["$_id", "regular"] },
            count: 1,
            bloodUnits: "$totalBloodUnits",
            _id: 0,
          },
        },
      ])
      .toArray()

    const hemoglobinAnalysis = await patientsCollection
      .aggregate([
        { $match: { status: "active", hb: { $exists: true, $ne: null } } },
        {
          $group: {
            _id: "$bloodType",
            avgHb: { $avg: "$hb" },
            minHb: { $min: "$hb" },
            maxHb: { $max: "$hb" },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            bloodType: "$_id",
            avgHb: { $round: ["$avgHb", 1] },
            minHb: 1,
            maxHb: 1,
            count: 1,
            _id: 0,
          },
        },
        { $sort: { count: -1 } },
      ])
      .toArray()

    const phenotypeAnalysis = await patientsCollection
      .aggregate([
        { $match: { status: "active", ph: { $exists: true, $ne: null } } },
        {
          $addFields: {
            isRarePhenotype: {
              $or: [
                { $regexMatch: { input: "$ph", regex: /[Cc]{2,}/ } }, // Complex C patterns
                { $regexMatch: { input: "$ph", regex: /[Ee]{2,}/ } }, // Complex E patterns
                { $regexMatch: { input: "$ph", regex: /k-/ } }, // Kell negative
                { $regexMatch: { input: "$ph", regex: /Fy$$a-b-$$/ } }, // Duffy negative
              ],
            },
          },
        },
        {
          $group: {
            _id: "$bloodType",
            total: { $sum: 1 },
            rarePhenotypes: {
              $sum: { $cond: ["$isRarePhenotype", 1, 0] },
            },
            totalBloodUnits: { $sum: { $ifNull: ["$poches", 0] } },
          },
        },
        {
          $project: {
            bloodType: "$_id",
            total: 1,
            rarePhenotypes: 1,
            rarePercentage: {
              $round: [{ $multiply: [{ $divide: ["$rarePhenotypes", "$total"] }, 100] }, 1],
            },
            totalBloodUnits: 1,
            _id: 0,
          },
        },
        { $sort: { rarePhenotypes: -1 } },
      ])
      .toArray()

    // Monthly trends with enhanced data
    const monthlyTrends = await transfusionsCollection
      .aggregate([
        { $match: dateFilter },
        {
          $lookup: {
            from: "patients",
            localField: "patientId",
            foreignField: "_id",
            as: "patient",
          },
        },
        { $unwind: { path: "$patient", preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$scheduledDate" } },
            transfusions: { $sum: 1 },
            totalBloodUnits: { $sum: { $ifNull: ["$patient.poches", 0] } },
            completed: {
              $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
            },
          },
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            month: "$_id",
            transfusions: 1,
            bloodUnits: "$totalBloodUnits",
            completed: 1,
            _id: 0,
          },
        },
      ])
      .toArray()

    return NextResponse.json({
      dailyTransfusions,
      bloodTypeDistribution: bloodTypeWithPercentages,
      priorityDistribution,
      monthlyTrends,
      hemoglobinAnalysis,
      phenotypeAnalysis,
    })
  } catch (error) {
    console.error("Error fetching analytics charts data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

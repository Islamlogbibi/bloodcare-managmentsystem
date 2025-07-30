import { getDatabase } from "@/lib/mongodb"
import { NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"

export async function GET(req: NextRequest) {
  const patientId = req.nextUrl.searchParams.get("id")
  if (!patientId) return NextResponse.json({ error: "Missing patient ID" }, { status: 400 })

  const db = await getDatabase()
  const transfusions = db.collection("transfusions")

  const result = await transfusions.aggregate([
    {
      $match: {
        patientId: new ObjectId(patientId),
      },
    },
    {
      $lookup: {
        from: "patients",
        localField: "patientId",
        foreignField: "_id",
        as: "patient",
      },
    },
    { $unwind: "$patient" },
    { $sort: { scheduledTime: 1 } },
  ]).toArray()

  return NextResponse.json(result)
}

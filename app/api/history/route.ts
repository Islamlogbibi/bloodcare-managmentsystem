import { getDatabase } from "@/lib/mongodb"
import { NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date")
  if (!date) return NextResponse.json([], { status: 400 })

  const db = await getDatabase()
  const transfusions = db.collection("transfusions")
  const start = new Date(date)
  const end = new Date(date)
  end.setDate(end.getDate() + 1)

  const result = await transfusions.aggregate([
    {
      $match: {
        scheduledTime: {
          $gte: start,
          $lt: end,
        },
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

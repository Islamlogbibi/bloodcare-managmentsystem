import { getDatabase } from "@/lib/mongodb"
import { NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid transfusion ID" }, { status: 400 })
    }

    const db = await getDatabase()
    const transfusions = db.collection("transfusions")

    const result = await transfusions.deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Transfusion not found" }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      message: "Transfusion supprimée avec succès" 
    })

  } catch (error) {
    console.error("Error deleting transfusion:", error)
    return NextResponse.json({ error: "Failed to delete transfusion" }, { status: 500 })
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid transfusion ID" }, { status: 400 })
    }

    const db = await getDatabase()
    const transfusions = db.collection("transfusions")

    const transfusion = await transfusions.aggregate([
      { $match: { _id: new ObjectId(id) } },
      {
        $lookup: {
          from: "patients",
          localField: "patientId",
          foreignField: "_id",
          as: "patient",
        },
      },
      { $unwind: "$patient" },
    ]).toArray()

    if (transfusion.length === 0) {
      return NextResponse.json({ error: "Transfusion not found" }, { status: 404 })
    }

    return NextResponse.json(transfusion[0])

  } catch (error) {
    console.error("Error fetching transfusion:", error)
    return NextResponse.json({ error: "Failed to fetch transfusion" }, { status: 500 })
  }
}

import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function getTransfusionsByDate(date: string) {
  const db = await getDatabase()
  const transfusions = db.collection("transfusions")

  // Match transfusions on the same day (UTC range)
  const start = new Date(date)
  const end = new Date(date)
  end.setDate(end.getDate() + 1)

  const result = await transfusions
    .aggregate([
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
      {
        $unwind: "$patient",
      },
      {
        $sort: {
          scheduledTime: 1,
        },
      },
    ])
    .toArray()

  return result
}

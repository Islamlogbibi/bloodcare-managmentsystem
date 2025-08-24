import { MongoClient } from "mongodb"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, User } from "lucide-react"

const client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017")
const dbName = "blood_donation_system"

async function getDailyHistory() {
  try {
    await client.connect()
    const db = client.db(dbName)
    const collection = db.collection("dailyHistory")

    const history = await collection.find().sort({ date: -1 }).toArray()

    return history.map((doc: any) => ({
      ...doc,
      _id: doc._id.toString(),
    }))
  } catch (error) {
    console.error("Failed to fetch daily history:", error)
    return []
  }
}

export default async function DailyHistoryPage() {
  const days = await getDailyHistory()

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold">Daily History</h1>

      {days.length === 0 && <p className="text-gray-500">No history available yet.</p>}

      {days.map((day) => (
        <Card key={day._id}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-600" />
              {day.date}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {day.patients.map((p: any, index: number) => (
              <div
                key={index}
                className="border p-4 rounded-md shadow-sm flex flex-col gap-1 bg-gray-50"
              >
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">{p.fullName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span>{p.time}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <Badge variant="outline">{p.transfusionType}</Badge>
                  <Badge variant="secondary">{p.status}</Badge>
                  {p.notes && (
                    <span className="text-sm text-gray-600 italic">Note: {p.notes}</span>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// clearHistory.js
import { MongoClient } from "mongodb"

const uri = "mongodb://127.0.0.1:27017" // adjust if needed
const client = new MongoClient(uri)

async function clearHistory() {
  try {
    await client.connect()
    const db = client.db("blood_donation_system")
    const result = await db.collection("patients").updateMany({}, { $set: { schedules: [] } })
    console.log(result)
  } finally {
    await client.close()
  }
}

clearHistory()

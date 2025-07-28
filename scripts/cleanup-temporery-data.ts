const { MongoClient } = require("mongodb")

const client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017")
const dbName = "blood_donation_system"

async function cleanupExpiredTemporaryData() {
  try {
    await client.connect()
    const db = client.db(dbName)
    const collection = db.collection("temporary_medical_data")

    const result = await collection.deleteMany({
      expiresAt: { $lt: new Date() },
    })

    console.log(`Cleaned up ${result.deletedCount} expired temporary medical records`)

    return result
  } catch (error) {
    console.error("Error cleaning up temporary data:", error)
    throw error
  } finally {
    await client.close()
  }
}

// Run cleanup if this script is executed directly
if (require.main === module) {
  cleanupExpiredTemporaryData()
    .then(() => {
      console.log("Cleanup completed successfully")
      process.exit(0)
    })
    .catch((error) => {
      console.error("Cleanup failed:", error)
      process.exit(1)
    })
}

module.exports = { cleanupExpiredTemporaryData }

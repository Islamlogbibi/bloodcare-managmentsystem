const { MongoClient } = require("mongodb")
const bcrypt = require("bcryptjs")
const fs = require("fs")
const path = require("path")

// Read .env file manually
function loadEnvFile() {
  const envPath = path.join(__dirname, "..", ".env")
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8")
    const envLines = envContent.split("\n")

    envLines.forEach((line) => {
      const trimmedLine = line.trim()
      if (trimmedLine && !trimmedLine.startsWith("#")) {
        const [key, ...valueParts] = trimmedLine.split("=")
        if (key && valueParts.length > 0) {
          const value = valueParts.join("=")
          process.env[key] = value
        }
      }
    })
  }
}

async function debugAdmin() {
  try {
    // Load environment variables
    loadEnvFile()

    const mongoUri = process.env.MONGODB_URI
    if (!mongoUri) {
      console.error("❌ MONGODB_URI not found in environment variables")
      return
    }

    console.log("🔍 Connecting to MongoDB...")
    const client = new MongoClient(mongoUri)
    await client.connect()

    const db = client.db("blood_donation_system")
    const usersCollection = db.collection("users")

    // Find all admin users
    console.log("🔍 Looking for admin users...")
    const adminUsers = await usersCollection.find({ role: "admin" }).toArray()

    console.log(`📊 Found ${adminUsers.length} admin user(s):`)
    adminUsers.forEach((user, index) => {
      console.log(`\n👤 Admin ${index + 1}:`)
      console.log(`   ID: ${user._id}`)
      console.log(`   Email: "${user.email}"`)
      console.log(`   Full Name: "${user.fullName}"`)
      console.log(`   Role: ${user.role}`)
      console.log(`   Password Hash: ${user.password.substring(0, 20)}...`)
      console.log(`   Created: ${user.createdAt}`)
    })

    // Test password verification for the specific admin
    const targetEmail = "brouk.hacene@univ-annaba.dz"
    const targetPassword = "adminadmin"

    console.log(`\n🔐 Testing login for: ${targetEmail}`)
    const user = await usersCollection.findOne({ email: targetEmail })

    if (!user) {
      console.log("❌ User not found with that email")
    } else {
      console.log("✅ User found in database")
      console.log(`   Stored email: "${user.email}"`)
      console.log(`   Email match: ${user.email === targetEmail}`)

      // Test password verification
      const isPasswordValid = await bcrypt.compare(targetPassword, user.password)
      console.log(`   Password verification: ${isPasswordValid ? "✅ VALID" : "❌ INVALID"}`)

      if (!isPasswordValid) {
        // Try to create a new hash and compare
        console.log("\n🔧 Testing password hashing...")
        const newHash = await bcrypt.hash(targetPassword, 12)
        console.log(`   New hash: ${newHash.substring(0, 20)}...`)
        const newHashValid = await bcrypt.compare(targetPassword, newHash)
        console.log(`   New hash verification: ${newHashValid ? "✅ VALID" : "❌ INVALID"}`)
      }
    }

    await client.close()
    console.log("\n✅ Debug complete")
  } catch (error) {
    console.error("❌ Error:", error.message)
  }
}

debugAdmin()

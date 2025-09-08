const fs = require("fs")
const path = require("path")
const { MongoClient } = require("mongodb")
const bcrypt = require("bcryptjs")

// Read .env file manually
function loadEnvFile() {
  try {
    const envPath = path.join(__dirname, "..", ".env")
    const envFile = fs.readFileSync(envPath, "utf8")

    envFile.split("\n").forEach((line) => {
      const [key, value] = line.split("=")
      if (key && value) {
        process.env[key.trim()] = value.trim()
      }
    })
    console.log("[v0] Environment variables loaded from .env file")
  } catch (error) {
    console.log("[v0] No .env file found, using system environment variables")
  }
}

// Load environment variables
loadEnvFile()

async function createNewAdmin() {
  if (!process.env.MONGODB_URI) {
    console.error("[v0] Error: MONGODB_URI environment variable is not set")
    console.error("[v0] Please set your MongoDB connection string in the environment variables")
    console.error("[v0] Example: MONGODB_URI=mongodb://localhost:27017/bloodcare")
    console.error("[v0] Or for MongoDB Atlas: MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/")
    process.exit(1)
  }

  const client = new MongoClient(process.env.MONGODB_URI)

  try {
    await client.connect()
    console.log("[v0] Connected to MongoDB")

    const db = client.db(process.env.MONGODB_DB || "bloodcare")
    const usersCollection = db.collection("users")

    // Hash the password
    const hashedPassword = await bcrypt.hash("adminadmin", 12)

    // Create the new admin user
    const newAdmin = {
      fullName: "Pr. brouk hacene",
      email: "brouk.hacene@univ-annaba.dz",
      password: hashedPassword,
      role: "admin",
      department: "Administration",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email: newAdmin.email })
    if (existingUser) {
      console.log("[v0] User with this email already exists, updating password...")
      await usersCollection.updateOne(
        { email: newAdmin.email },
        {
          $set: {
            password: hashedPassword,
            role: "admin",
            fullName: "Pr. brouk hacene",
            department: "Administration",
            isActive: true,
            updatedAt: new Date(),
          },
        },
      )
      console.log("[v0] Admin user updated successfully")
    } else {
      // Insert the new admin
      const result = await usersCollection.insertOne(newAdmin)
      console.log("[v0] New admin user created successfully with ID:", result.insertedId)
    }

    console.log("[v0] Admin credentials:")
    console.log("[v0] Email: brouk.hacene@univ-annaba.dz")
    console.log("[v0] Password: adminadmin")
  } catch (error) {
    console.error("[v0] Error creating admin:", error)
  } finally {
    await client.close()
    console.log("[v0] Database connection closed")
  }
}

createNewAdmin()

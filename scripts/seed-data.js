const { MongoClient } = require("mongodb")

const client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017")
const dbName = "blood_donation_system"

async function seedDatabase() {
  try {
    await client.connect()
    const db = client.db(dbName)

    // Clear existing data
    await db.collection("patients").deleteMany({})
    await db.collection("transfusions").deleteMany({})

    // Sample patients data
    const samplePatients = [
      {
        patientId: "PAT001234",
        firstName: "John",
        lastName: "Doe",
        dateOfBirth: "1985-06-15",
        gender: "male",
        bloodType: "O+",
        phone: "+1-555-0123",
        email: "john.doe@email.com",
        address: "123 Main Street, Springfield, IL 62701",
        emergencyContact: "Jane Doe",
        emergencyPhone: "+1-555-0124",
        medicalHistory: "No significant medical history. Regular blood donor.",
        admissionDate: new Date("2024-01-15"),
        lastDonationDate: new Date("2024-11-01"),
        weight: 75.5,
        height: 180,
        hemoglobinLevel: 14.2,
        hasF: false,
        hasC: true,
        hasL: true,
        patientCategory: "HyperRegime",
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        patientId: "PAT001235",
        firstName: "Sarah",
        lastName: "Johnson",
        dateOfBirth: "1990-03-22",
        gender: "female",
        bloodType: "A+",
        phone: "+1-555-0125",
        email: "sarah.johnson@email.com",
        address: "456 Oak Avenue, Springfield, IL 62702",
        emergencyContact: "Mike Johnson",
        emergencyPhone: "+1-555-0126",
        medicalHistory: "Mild anemia, taking iron supplements. Previous successful transfusions.",
        admissionDate: new Date("2024-02-10"),
        lastDonationDate: new Date("2024-10-15"),
        weight: 62.0,
        height: 165,
        hemoglobinLevel: 12.8,
        hasF: true,
        hasC: false,
        hasL: false,
        patientCategory: "PolyTransfuses",
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        patientId: "PAT001236",
        firstName: "Michael",
        lastName: "Brown",
        dateOfBirth: "1978-11-08",
        gender: "male",
        bloodType: "B-",
        phone: "+1-555-0127",
        email: "michael.brown@email.com",
        address: "789 Pine Street, Springfield, IL 62703",
        emergencyContact: "Lisa Brown",
        emergencyPhone: "+1-555-0128",
        medicalHistory: "Hypertension, controlled with medication. Regular monitoring required.",
        admissionDate: new Date("2024-03-05"),
        lastDonationDate: new Date("2024-09-20"),
        weight: 82.3,
        height: 175,
        hemoglobinLevel: 15.1,
        hasF: false,
        hasC: false,
        hasL: false,
        patientCategory: "Echanges",
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        patientId: "PAT001237",
        firstName: "Emily",
        lastName: "Davis",
        dateOfBirth: "1992-07-14",
        gender: "female",
        bloodType: "AB+",
        phone: "+1-555-0129",
        email: "emily.davis@email.com",
        address: "321 Elm Street, Springfield, IL 62704",
        emergencyContact: "Robert Davis",
        emergencyPhone: "+1-555-0130",
        medicalHistory: "No known allergies. First-time blood recipient.",
        admissionDate: new Date("2024-06-01"),
        lastDonationDate: null,
        weight: 58.5,
        height: 162,
        hemoglobinLevel: 13.5,
        hasF: false,
        hasC: true,
        hasL: false,
        patientCategory: "PDV",
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        patientId: "PAT001238",
        firstName: "David",
        lastName: "Wilson",
        dateOfBirth: "1983-12-03",
        gender: "male",
        bloodType: "O-",
        phone: "+1-555-0131",
        email: "david.wilson@email.com",
        address: "654 Maple Drive, Springfield, IL 62705",
        emergencyContact: "Susan Wilson",
        emergencyPhone: "+1-555-0132",
        medicalHistory: "Diabetes Type 2, well controlled. Universal donor.",
        admissionDate: new Date("2024-04-20"),
        lastDonationDate: new Date("2024-11-15"),
        weight: 78.0,
        height: 183,
        hemoglobinLevel: 14.8,
        hasF: true,
        hasC: false,
        hasL: true,
        patientCategory: "Echanges Occasionnels",
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    // Insert sample patients
    const patientsCollection = db.collection("patients")
    const patientResult = await patientsCollection.insertMany(samplePatients)
    console.log(`✅ Inserted ${patientResult.insertedCount} patients`)

    // Sample transfusions data
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const sampleTransfusions = [
      {
        transfusionId: "TRN001001",
        patientId: patientResult.insertedIds[0],
        scheduledDate: today,
        scheduledTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0, 0),
        priority: "regular",
        status: "scheduled",
        bloodUnits: 2,
        notes: "Regular scheduled transfusion for maintenance therapy",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        transfusionId: "TRN001002",
        patientId: patientResult.insertedIds[1],
        scheduledDate: today,
        scheduledTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 30, 0),
        priority: "urgent",
        status: "scheduled",
        bloodUnits: 1,
        notes: "Urgent transfusion needed due to low hemoglobin levels",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        transfusionId: "TRN001003",
        patientId: patientResult.insertedIds[2],
        scheduledDate: tomorrow,
        scheduledTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 10, 0, 0),
        priority: "regular",
        status: "scheduled",
        bloodUnits: 2,
        notes: "Follow-up transfusion as part of treatment plan",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        transfusionId: "TRN001004",
        patientId: patientResult.insertedIds[3],
        scheduledDate: tomorrow,
        scheduledTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 15, 0, 0),
        priority: "urgent",
        status: "scheduled",
        bloodUnits: 3,
        notes: "Emergency transfusion for severe anemia",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        transfusionId: "TRN001005",
        patientId: patientResult.insertedIds[4],
        scheduledDate: today,
        scheduledTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 30, 0),
        priority: "regular",
        status: "in-progress",
        bloodUnits: 1,
        notes: "Routine transfusion for chronic condition management",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    // Insert sample transfusions
    const transfusionsCollection = db.collection("transfusions")
    const transfusionResult = await transfusionsCollection.insertMany(sampleTransfusions)
    console.log(`✅ Inserted ${transfusionResult.insertedCount} transfusions`)

    // Create indexes for better performance
    await patientsCollection.createIndex({ patientId: 1 }, { unique: true })
    await patientsCollection.createIndex({ lastName: 1, firstName: 1 })
    await patientsCollection.createIndex({ bloodType: 1 })
    await patientsCollection.createIndex({ phone: 1 })
    await patientsCollection.createIndex({ status: 1 })
    await patientsCollection.createIndex({ patientCategory: 1 })
    await patientsCollection.createIndex({ hasF: 1 })
    await patientsCollection.createIndex({ hasC: 1 })
    await patientsCollection.createIndex({ hasL: 1 })

    await transfusionsCollection.createIndex({ transfusionId: 1 }, { unique: true })
    await transfusionsCollection.createIndex({ scheduledDate: 1 })
    await transfusionsCollection.createIndex({ patientId: 1 })
    await transfusionsCollection.createIndex({ priority: 1, status: 1 })
    await transfusionsCollection.createIndex({ status: 1 })

    console.log("✅ Created database indexes")
    console.log("🎉 Database seeded successfully!")

    // Display summary
    console.log("\n📊 Database Summary:")
    console.log(`   • Patients: ${patientResult.insertedCount}`)
    console.log(`   • Transfusions: ${transfusionResult.insertedCount}`)
    console.log(
      `   • Today's appointments: ${sampleTransfusions.filter((t) => t.scheduledDate.toDateString() === today.toDateString()).length}`,
    )
    console.log(
      `   • Tomorrow's appointments: ${sampleTransfusions.filter((t) => t.scheduledDate.toDateString() === tomorrow.toDateString()).length}`,
    )
  } catch (error) {
    console.error("❌ Error seeding database:", error)
  } finally {
    await client.close()
  }
}

seedDatabase()

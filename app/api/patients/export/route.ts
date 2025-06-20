export const dynamic = "force-dynamic"; 

import { type NextRequest, NextResponse } from "next/server"
import { getPatients } from "@/app/lib/actions"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Build filters from query parameters
    const filters: any = {}

    if (searchParams.get("search")) {
      filters.search = searchParams.get("search")
    }

    if (searchParams.get("patientCategory") && searchParams.get("patientCategory") !== "All Patients") {
      filters.patientCategory = searchParams.get("patientCategory")
    }

    if (searchParams.get("bloodType") && searchParams.get("bloodType") !== "all") {
      filters.bloodType = searchParams.get("bloodType")
    }

    if (searchParams.get("gender") && searchParams.get("gender") !== "all") {
      filters.gender = searchParams.get("gender")
    }

    // Fetch patients with filters
    const patients = await getPatients(filters)

    // Create CSV content
    const csvHeaders = [
      "First Name",
      "Last Name",
      "Blood Type",
      "Gender",
      "Phone",
      "Email",
      "Date of Birth",
      "Last Donation Date",
      "Patient Category",
      "Has F",
      "Has C",
      "Has L",
    ]

    const csvRows = patients.map((patient) => [
      patient.firstName || "",
      patient.lastName || "",
      patient.bloodType || "",
      patient.gender || "",
      patient.phone || "",
      patient.email || "",
      patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : "",
      patient.lastDonationDate ? new Date(patient.lastDonationDate).toLocaleDateString() : "",
      patient.patientCategory || "",
      patient.hasF ? "Yes" : "No",
      patient.hasC ? "Yes" : "No",
      patient.hasL ? "Yes" : "No",
    ])

    const csvContent = [csvHeaders.join(","), ...csvRows.map((row) => row.map((field) => `"${field}"`).join(","))].join(
      "\n",
    )

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="patients.csv"',
      },
    })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ error: "Failed to export patients" }, { status: 500 })
  }
}

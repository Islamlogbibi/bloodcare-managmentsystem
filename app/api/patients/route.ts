export const dynamic = "force-dynamic"; 

import { type NextRequest, NextResponse } from "next/server"
import { patientService } from "@/lib/services/patient-service"

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get("search") || undefined
    const category = searchParams.get("category") || undefined
    const bloodType = searchParams.get("bloodType") || undefined
    const gender = searchParams.get("gender") || undefined

    // Build filters
    const filters: any = {}

    if (search) {
      filters.search = search
    }

    if (category && category !== "All Patients") {
      filters.patientCategory = category
    }

    if (bloodType && bloodType !== "all") {
      filters.bloodType = bloodType
    }

    if (gender && gender !== "all") {
      filters.gender = gender
    }

    // Get patients
    const patients = await patientService.getPatients(filters)

    return NextResponse.json(patients)
  } catch (error) {
    console.error("Error fetching patients:", error)
    return NextResponse.json({ error: "Failed to fetch patients" }, { status: 500 })
  }
}

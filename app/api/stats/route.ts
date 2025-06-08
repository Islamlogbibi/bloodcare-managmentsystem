import { type NextRequest, NextResponse } from "next/server"
import { patientService } from "@/lib/services/patient-service"
import { transfusionService } from "@/lib/services/transfusion-service"

export async function GET(request: NextRequest) {
  try {
    const [patientStats, transfusionStats, bloodTypeDistribution] = await Promise.all([
      patientService.getPatientStats(),
      transfusionService.getTransfusionStats(),
      patientService.getBloodTypeDistribution(),
    ])

    return NextResponse.json({
      patients: patientStats,
      transfusions: transfusionStats,
      bloodTypeDistribution,
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

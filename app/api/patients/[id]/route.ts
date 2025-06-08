import { type NextRequest, NextResponse } from "next/server"
import { patientService } from "@/lib/services/patient-service"
import { updatePatientSchema } from "@/lib/validations/patient"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const patient = await patientService.getPatientById(params.id)

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    }

    return NextResponse.json(patient)
  } catch (error) {
    console.error("Error fetching patient:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const validatedData = updatePatientSchema.parse(body)

    const result = await patientService.updatePatient(params.id, validatedData)

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating patient:", error)

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Validation error", details: error }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const result = await patientService.deletePatient(params.id)

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting patient:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

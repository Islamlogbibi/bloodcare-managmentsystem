import { type NextRequest, NextResponse } from "next/server"
import { transfusionService } from "@/lib/services/transfusion-service"
import { createTransfusionSchema, transfusionQuerySchema } from "@/lib/validations/transfusion"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams.entries())

    const validatedParams = transfusionQuerySchema.parse(queryParams)

    const filters = {
      page: Number.parseInt(validatedParams.page),
      limit: Number.parseInt(validatedParams.limit),
      date: validatedParams.date,
      priority: validatedParams.priority,
      status: validatedParams.status,
      patientId: validatedParams.patientId,
    }

    const result = await transfusionService.getTransfusions(filters)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching transfusions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createTransfusionSchema.parse(body)

    const transfusion = await transfusionService.createTransfusion(validatedData)

    return NextResponse.json(transfusion, { status: 201 })
  } catch (error) {
    console.error("Error creating transfusion:", error)

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Validation error", details: error }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

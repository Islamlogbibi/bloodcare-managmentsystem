import { type NextRequest, NextResponse } from "next/server"
import { transfusionService } from "@/lib/services/transfusion-service"

export async function GET(request: NextRequest) {
  try {
    const result = await transfusionService.getTodayTransfusions()

    return NextResponse.json(result.transfusions)
  } catch (error) {
    console.error("Error fetching today's transfusions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

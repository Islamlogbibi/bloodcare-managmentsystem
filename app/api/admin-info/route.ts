import { NextResponse } from "next/server"
import { userService } from "@/lib/services/user-service"

export async function GET() {
  try {
    // Get all users and filter for admins
    const allUsers = await userService.getAllUsers()
    const adminUsers = allUsers.filter((user) => user.role === "admin")

    return NextResponse.json({
      admins: adminUsers,
      count: adminUsers.length,
    })
  } catch (error) {
    console.error("[v0] Admin info error:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des informations administrateur" },
      { status: 500 },
    )
  }
}

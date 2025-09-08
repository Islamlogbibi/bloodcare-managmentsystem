import { type NextRequest, NextResponse } from "next/server"
import { userService } from "@/lib/services/user-service"

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName } = await request.json()

    console.log("[v0] Creating admin user:", email)

    // Check if any admin already exists
    const existingUsers = await userService.getAllUsers()
    const hasAdmin = existingUsers.some((user) => user.role === "admin")

    if (hasAdmin) {
      return NextResponse.json({ error: "Un administrateur existe déjà" }, { status: 400 })
    }

    const adminUser = await userService.createUser({
      email,
      password,
      fullName,
      role: "admin",
      department: "Administration",
      isActive: true,
    })

    console.log("[v0] Admin user created successfully:", adminUser.email)

    return NextResponse.json({
      message: "Administrateur créé avec succès",
      user: {
        id: adminUser._id,
        email: adminUser.email,
        fullName: adminUser.fullName,
        role: adminUser.role,
      },
    })
  } catch (error) {
    console.error("[v0] Create admin error:", error)
    return NextResponse.json({ error: "Erreur lors de la création de l'administrateur" }, { status: 500 })
  }
}

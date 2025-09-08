import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { userService } from "@/lib/services/user-service"

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const user = await userService.getUserById(session.userId)

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
    }

    return NextResponse.json({
      user: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        department: user.department,
        phone: user.phone,
        isActive: user.isActive,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      },
    })
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

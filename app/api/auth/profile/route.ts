import { type NextRequest, NextResponse } from "next/server"
import { userService } from "@/lib/services/user-service"
import { withAuth } from "@/lib/auth-middleware"

export async function PUT(request: NextRequest) {
  return withAuth(request, async (req, session) => {
    try {
      const { fullName, phone, department } = await req.json()

      if (!fullName) {
        return NextResponse.json({ error: "Le nom complet est requis" }, { status: 400 })
      }

      const updatedUser = await userService.updateUser(session.userId, {
        fullName,
        phone,
        department,
      })

      if (!updatedUser) {
        return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
      }

      return NextResponse.json({
        message: "Profil mis à jour avec succès",
        user: updatedUser,
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      return NextResponse.json({ error: "Erreur lors de la mise à jour du profil" }, { status: 500 })
    }
  })
}

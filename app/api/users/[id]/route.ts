import { type NextRequest, NextResponse } from "next/server"
import { userService } from "@/lib/services/user-service"
import { withAuth } from "@/lib/auth-middleware"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  return withAuth(
    request,
    async (req, session) => {
      try {
        const { fullName, role, department, phone } = await req.json()
        const userId = params.id

        const updatedUser = await userService.updateUser(userId, {
          fullName,
          role,
          department,
          phone,
        })

        if (!updatedUser) {
          return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
        }

        return NextResponse.json({
          message: "Utilisateur modifié avec succès",
          user: updatedUser,
        })
      } catch (error) {
        console.error("Error updating user:", error)
        return NextResponse.json({ error: "Erreur lors de la modification de l'utilisateur" }, { status: 500 })
      }
    },
    { requiredRole: "admin" },
  )
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  return withAuth(
    request,
    async (req, session) => {
      try {
        const userId = params.id

        // Prevent admin from deactivating themselves
        if (userId === session.userId) {
          return NextResponse.json({ error: "Vous ne pouvez pas désactiver votre propre compte" }, { status: 400 })
        }

        const success = await userService.deactivateUser(userId)

        if (!success) {
          return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
        }

        return NextResponse.json({ message: "Utilisateur désactivé avec succès" })
      } catch (error) {
        console.error("Error deactivating user:", error)
        return NextResponse.json({ error: "Erreur lors de la désactivation de l'utilisateur" }, { status: 500 })
      }
    },
    { requiredRole: "admin" },
  )
}

import { type NextRequest, NextResponse } from "next/server"
import { userService } from "@/lib/services/user-service"
import { withAuth } from "@/lib/auth-middleware"

export async function GET(request: NextRequest) {
  return withAuth(
    request,
    async (req, session) => {
      try {
        const users = await userService.getAllUsers()
        return NextResponse.json({ users })
      } catch (error) {
        console.error("Error fetching users:", error)
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
      }
    },
    { requiredRole: "admin" },
  )
}

export async function POST(request: NextRequest) {
  return withAuth(
    request,
    async (req, session) => {
      try {
        const { fullName, email, password, role, department, phone } = await req.json()

        if (!fullName || !email || !password || !role || !department) {
          return NextResponse.json({ error: "Tous les champs obligatoires doivent être remplis" }, { status: 400 })
        }

        const user = await userService.createUser({
          fullName,
          email,
          password,
          role,
          department,
          phone,
        })

        return NextResponse.json({
          message: "Utilisateur créé avec succès",
          user: {
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            department: user.department,
            phone: user.phone,
            isActive: user.isActive,
            createdAt: user.createdAt,
          },
        })
      } catch (error) {
        console.error("Error creating user:", error)

        if (error instanceof Error && error.message.includes("already exists")) {
          return NextResponse.json({ error: "Un utilisateur avec cet email existe déjà" }, { status: 409 })
        }

        return NextResponse.json({ error: "Erreur lors de la création de l'utilisateur" }, { status: 500 })
      }
    },
    { requiredRole: "admin" },
  )
}

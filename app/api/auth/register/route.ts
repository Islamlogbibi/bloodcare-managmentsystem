import { type NextRequest, NextResponse } from "next/server"
import { userService } from "@/lib/services/user-service"

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, role, department, phone } = await request.json()

    if (!email || !password || !fullName || !role || !department) {
      return NextResponse.json({ error: "Tous les champs obligatoires doivent être remplis" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Le mot de passe doit contenir au moins 6 caractères" }, { status: 400 })
    }

    const user = await userService.createUser({
      email,
      password,
      fullName,
      role,
      department,
      phone,
    })

    return NextResponse.json({
      message: "Compte créé avec succès",
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        department: user.department,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)

    if (error instanceof Error && error.message.includes("already exists")) {
      return NextResponse.json({ error: "Un compte avec cet email existe déjà" }, { status: 409 })
    }

    return NextResponse.json({ error: "Erreur lors de la création du compte" }, { status: 500 })
  }
}

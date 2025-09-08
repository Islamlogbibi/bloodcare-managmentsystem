import { type NextRequest, NextResponse } from "next/server"
import { userService } from "@/lib/services/user-service"
import { createSession } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    console.log("[v0] Login attempt for email:", email)

    if (!email || !password) {
      console.log("[v0] Missing email or password")
      return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 })
    }

    console.log("[v0] Attempting to authenticate user...")
    const user = await userService.authenticateUser({ email, password })
    console.log("[v0] Authentication result:", user ? "Success" : "Failed")

    if (!user) {
      return NextResponse.json({ error: "Email ou mot de passe incorrect" }, { status: 401 })
    }

    console.log("[v0] Creating session for user:", user.email)
    await createSession(user)

    return NextResponse.json({
      message: "Connexion réussie",
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        department: user.department,
      },
    })
  } catch (error) {
    console.error("[v0] Login error:", error)
    return NextResponse.json({ error: "Erreur de connexion" }, { status: 500 })
  }
}

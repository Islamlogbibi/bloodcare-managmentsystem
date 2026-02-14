import { NextResponse } from "next/server"
import { deleteSession } from "@/lib/auth"

export async function POST() {
  try {
    await deleteSession()
    return NextResponse.json({ message: "Déconnexion réussie" })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Erreur de déconnexion" }, { status: 500 })
  }
}

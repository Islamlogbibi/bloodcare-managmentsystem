import { compare, hash } from "bcryptjs"
import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import type { JWTPayload } from "jose"

const key = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key")

export type UserRole = "admin" | "doctor" | "assistant"

export interface User {
  _id: string
  email: string
  fullName: string
  role: UserRole
  department: string
  phone?: string
  isActive: boolean
  createdAt: Date
  lastLogin?: Date
}

export interface SessionPayload {
  userId: string
  email: string
  role: UserRole
  expiresAt: Date
}

export async function encrypt(payload: SessionPayload) {
  return await new SignJWT(payload as unknown as JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(key)
}


export async function decrypt(input: string): Promise<SessionPayload> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ["HS256"],
  })

  return {
    userId: payload.userId as string,
    email: payload.email as string,
    role: payload.role as UserRole,
    expiresAt: new Date(payload.expiresAt as string),
  }
}


export async function hashPassword(password: string): Promise<string> {
  return await hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await compare(password, hashedPassword)
}

export async function getSession(): Promise<SessionPayload | null> {
  const session = cookies().get("session")?.value
  if (!session) return null

  try {
    const payload = await decrypt(session)
    return payload
  } catch (error) {
    return null
  }
}

export async function createSession(user: User) {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  const session = await encrypt({
    userId: user._id,
    email: user.email,
    role: user.role,
    expiresAt,
  })

  cookies().set("session", session, {
    expires: expiresAt,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  })
}

export async function deleteSession() {
  cookies().delete("session")
}

export function hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy = {
    admin: 3,
    doctor: 2,
    assistant: 1,
  }

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

export function getUserPermissions(role: UserRole) {
  const permissions = {
    admin: {
      canViewAnalytics: true,
      canManageUsers: true,
      canManagePatients: true,
      canScheduleTransfusions: true,
      canViewReports: true,
      canExportData: true,
      canManageSettings: true,
    },
    doctor: {
      canViewAnalytics: true,
      canManageUsers: false,
      canManagePatients: true,
      canScheduleTransfusions: true,
      canViewReports: true,
      canExportData: true,
      canManageSettings: false,
    },
    assistant: {
      canViewAnalytics: false,
      canManageUsers: false,
      canManagePatients: true,
      canScheduleTransfusions: true,
      canViewReports: false,
      canExportData: false,
      canManageSettings: false,
    },
  }

  return permissions[role]
}

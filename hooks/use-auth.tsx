"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"

export interface User {
  id: string
  email: string
  name: string
  role: "admin" | "doctor" | "assistant"
  isActive: boolean
  _id?: string
  fullName?: string
  department?: string
  phone?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  hasPermission: (permission: string) => boolean
  checkAuth: () => Promise<void> // Added checkAuth method to interface
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const publicRoutes = ["/login", "/setup-admin"]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Check for existing session on mount
  useEffect(() => {
    checkAuth()
  }, [])

  // Handle route protection
  useEffect(() => {
    if (!isLoading) {
      const isPublicRoute = publicRoutes.includes(pathname)

      if (!user && !isPublicRoute) {
        router.push("/login")
      } else if (user && pathname === "/login") {
        router.push("/")
      }
    }
  }, [user, isLoading, pathname, router])

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const data = await response.json()
        const userData = data.user || data
        const normalizedUser: User = {
          id: userData._id || userData.id,
          email: userData.email,
          name: userData.fullName || userData.name,
          role: userData.role,
          isActive: userData.isActive !== false, // Default to true if not specified
          _id: userData._id,
          fullName: userData.fullName,
          department: userData.department,
          phone: userData.phone,
        }
        console.log("[v0] Auth check successful, user:", normalizedUser)
        setUser(normalizedUser)
      } else {
        console.log("[v0] Auth check failed, no valid session")
        setUser(null)
      }
    } catch (error) {
      console.error("[v0] Auth check error:", error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        const userData = data.user
        const normalizedUser: User = {
          id: userData.id || userData._id,
          email: userData.email,
          name: userData.fullName || userData.name,
          role: userData.role,
          isActive: true,
          _id: userData._id || userData.id,
          fullName: userData.fullName,
          department: userData.department,
          phone: userData.phone,
        }
        console.log("[v0] Login successful, setting user:", normalizedUser)
        setUser(normalizedUser)
        router.push("/")
        return { success: true }
      } else {
        return { success: false, error: data.error || "Login failed" }
      }
    } catch (error) {
      console.error("[v0] Login error:", error)
      return { success: false, error: "Network error" }
    }
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setUser(null)
      router.push("/login")
    }
  }

  const hasPermission = (permission: string): boolean => {
    if (!user) return false

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

    const userPermissions = permissions[user.role] || {}
    return userPermissions[permission as keyof typeof userPermissions] || false
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, hasPermission, checkAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

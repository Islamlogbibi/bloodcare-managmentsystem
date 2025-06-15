"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Home, Users, Calendar, Clock, Settings, Activity, Heart, BarChart3, Menu, X } from "lucide-react"
import { useState, useEffect } from "react"
import { useLanguage } from "@/contexts/language-context"





export function Sidebar() {
  const { t } = useLanguage()
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const navigation = [
    { name: t("Dashboard"), href: "/", icon: Home, description: "Overview and statistics" },
    { name: t("Patients"), href: "/patients", icon: Users, description: "Manage patient records" },
    { name: t("Today's Schedule"), href: "/transfusions/today", icon: Clock, description: "Today's appointments" },
    {
      name: t("Tomorrow's Schedule"),
      href: "/transfusions/tomorrow",
      icon: Calendar,
      description: "Tomorrow's appointments",
    },
    { name: t("History"), href: "/history", icon: BarChart3, description: "View history" },
    { name: t("Settings"), href: "/settings", icon: Settings, description: "Application settings" },
  ]

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileOpen(false)
      }
    }

    if (isMobileOpen) {
      document.addEventListener("keydown", handleEscape)
      return () => document.removeEventListener("keydown", handleEscape)
    }
  }, [isMobileOpen])

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden no-print"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        aria-label={isMobileOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={isMobileOpen}
        aria-controls="sidebar-navigation"
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        id="sidebar-navigation"
        className={cn(
          "flex flex-col bg-white border-r border-gray-200 shadow-lg transition-all duration-300 ease-in-out z-50",
          "fixed md:relative inset-y-0 left-0",
          isCollapsed ? "w-16" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Header */}
        <div
          className={cn(
            "flex items-center justify-center h-16 px-4 border-b border-gray-200 bg-gradient-to-r from-red-600 to-red-700",
            isCollapsed && "px-2",
          )}
        >
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
              <Heart className="w-5 h-5 text-red-600" aria-hidden="true" />
            </div>
            {!isCollapsed && (
              <div className="animate-fade-in">
                <h1 className="text-lg font-bold text-white">BloodCare</h1>
                <p className="text-xs text-red-100">Management System</p>
              </div>
            )}
          </div>
        </div>

        {/* Collapse button for desktop */}
        <div className="hidden md:flex justify-end p-2 border-b border-gray-100">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="h-8 w-8 p-0 hover:bg-gray-100"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto" role="menubar">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))

            return (
              <Link key={item.name} href={item.href} role="menuitem">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start h-11 px-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 group focus-ring",
                    isActive && "bg-red-50 text-red-700 hover:bg-red-50 hover:text-red-700 border-r-2 border-red-600",
                    isCollapsed && "px-2 justify-center",
                  )}
                  title={isCollapsed ? `${item.name}: ${item.description}` : undefined}
                  aria-current={isActive ? "page" : undefined}
                >
                  <item.icon
                    className={cn(
                      "h-4 w-4 transition-transform duration-200 group-hover:scale-110",
                      !isCollapsed && "mr-3",
                    )}
                    aria-hidden="true"
                  />
                  {!isCollapsed && (
                    <div className="animate-fade-in">
                      <span className="font-medium">{item.name}</span>
                    </div>
                  )}
                </Button>
              </Link>
            )
          })}
        </nav>

        {/* System Status */}
        <div className={cn("p-4 border-t border-gray-200", isCollapsed && "px-2")}>
          <div
            className={cn(
              "bg-gradient-to-r from-blue-50 to-green-50 p-3 rounded-lg border border-blue-200",
              isCollapsed && "p-2",
            )}
          >
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-green-600 animate-pulse" aria-hidden="true" />
              {!isCollapsed && (
                <div className="animate-fade-in">
                  <span className="text-sm font-medium text-blue-900">System Status</span>
                  <p className="text-xs text-blue-700 mt-1">All systems operational</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

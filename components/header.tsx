"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function Header() {
  const [profileData, setProfileData] = useState({
    fullName: "Pr. brouk hassen",
    email: "brouk.hassen@univ-annaba.com",
    department: "hematology",
  })

  useEffect(() => {
    // Load saved profile data from localStorage on component mount
    const savedProfileData = localStorage.getItem("profileData")
    if (savedProfileData) {
      setProfileData(JSON.parse(savedProfileData))
    }

    // Listen for profile updates
    const handleProfileUpdate = (event: CustomEvent) => {
      if (event.detail) {
        setProfileData(event.detail)
      }
    }

    window.addEventListener("profileUpdated", handleProfileUpdate as EventListener)

    return () => {
      window.removeEventListener("profileUpdated", handleProfileUpdate as EventListener)
    }
  }, [])

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex flex-1 items-center gap-2 md:gap-4">
        <form className="hidden flex-1 md:flex md:max-w-sm">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher..."
              className="w-full bg-background pl-8 md:w-[300px] lg:w-[400px]"
            />
          </div>
        </form>
        <Button variant="outline" size="icon" className="h-8 w-8 md:hidden bg-transparent">
          <Search className="h-4 w-4" />
          <span className="sr-only">Rechercher</span>
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="rounded-full pl-1 pr-3 bg-transparent">
              <Avatar className="h-6 w-6 mr-2">
                <AvatarFallback className="bg-red-100 text-red-800 text-xs">
                  {getInitials(profileData.fullName)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-medium">{profileData.fullName}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Mon Compte</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href="/settings" className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                <span>Paramètres</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

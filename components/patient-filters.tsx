"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"

interface PatientFiltersProps {
  onFiltersChange?: (filters: any) => void
}

export function PatientFilters({ onFiltersChange }: PatientFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "")
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "All Patients")
  const [selectedBloodType, setSelectedBloodType] = useState(searchParams.get("bloodType") || "")
  const [selectedPh, setSelectedPh] = useState(searchParams.get("ph") || "")
  const [activeFilters, setActiveFilters] = useState<string[]>([])

  const categories = [
    {
      value: "All Patients",
      label: "All Patients",
      activeClass: "bg-gray-900 text-white hover:bg-gray-800",
      inactiveClass: "border border-gray-300 text-gray-700 hover:bg-gray-50",
    },
    {
      value: "HyperRegime",
      label: "HyperRegime",
      activeClass: "bg-blue-600 text-white hover:bg-blue-700",
      inactiveClass: "border border-blue-500 text-blue-700 hover:bg-blue-50",
    },
    {
      value: "PolyTransfuses",
      label: "PolyTransfuses",
      activeClass: "bg-green-600 text-white hover:bg-green-700",
      inactiveClass: "border border-green-500 text-green-700 hover:bg-green-50",
    },
    {
      value: "Echanges",
      label: "Echanges",
      activeClass: "bg-purple-600 text-white hover:bg-purple-700",
      inactiveClass: "border border-purple-500 text-purple-700 hover:bg-purple-50",
    },
    {
      value: "PDV",
      label: "PDV",
      activeClass: "bg-orange-600 text-white hover:bg-orange-700",
      inactiveClass: "border border-orange-500 text-orange-700 hover:bg-orange-50",
    },
    {
      value: "Echanges Occasionnels",
      label: "Echanges Occasionnels",
      activeClass: "bg-pink-600 text-white hover:bg-pink-700",
      inactiveClass: "border border-pink-500 text-pink-700 hover:bg-pink-50",
    },
  ]

  useEffect(() => {
    const filters = []
    if (selectedBloodType && selectedBloodType !== "all") filters.push(`Blood Type: ${selectedBloodType}`)
    if (selectedPh && selectedPh !== "all") filters.push(`Ph: ${selectedPh}`)
    setActiveFilters(filters)
  }, [selectedBloodType, selectedPh])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    updateURL({ search: value })
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    updateURL({ category })
  }

  const handleBloodTypeChange = (bloodType: string) => {
    setSelectedBloodType(bloodType)
    updateURL({ bloodType })
  }

  const handlePhChange = (ph: string) => {
    setSelectedPh(ph)
    updateURL({ ph })
  }

  const updateURL = (newParams: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString())

    Object.entries(newParams).forEach(([key, value]) => {
      if (value && value !== "all") {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })

    router.push(`/patients?${params.toString()}`)
  }

  const clearAllFilters = () => {
    setSearchTerm("")
    setSelectedCategory("All Patients")
    setSelectedBloodType("")
    setSelectedPh("")
    setActiveFilters([])
    router.push("/patients")
  }

  const removeFilter = (filter: string) => {
    if (filter.startsWith("Blood Type:")) {
      setSelectedBloodType("")
      updateURL({ bloodType: "" })
    } else if (filter.startsWith("Ph:")) {
      setSelectedPh("")
      updateURL({ ph: "" })
    }
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search patients..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md"
        />
      </div>

      {/* Category Filter Tags */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-700">Patient Categories</Label>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const isSelected = selectedCategory === category.value
            return (
              <button
                key={category.value}
                onClick={() => handleCategoryChange(category.value)}
                className={cn(
                  "px-4 py-2 rounded-md font-medium cursor-pointer transition-all duration-200 text-sm",
                  isSelected ? category.activeClass : category.inactiveClass,
                )}
              >
                {category.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Additional Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="bloodType" className="text-sm font-medium text-gray-700">
            Blood Type
          </Label>
          <Select value={selectedBloodType} onValueChange={handleBloodTypeChange}>
            <SelectTrigger className="border-gray-300 focus:border-red-500 focus:ring-red-500">
              <SelectValue placeholder="All blood types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All blood types</SelectItem>
              <SelectItem value="A+">A+ Positive</SelectItem>
              <SelectItem value="A-">A- Negative</SelectItem>
              <SelectItem value="B+">B+ Positive</SelectItem>
              <SelectItem value="B-">B- Negative</SelectItem>
              <SelectItem value="AB+">AB+ Positive</SelectItem>
              <SelectItem value="AB-">AB- Negative</SelectItem>
              <SelectItem value="O+">O+ Positive</SelectItem>
              <SelectItem value="O-">O- Negative</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ph" className="text-sm font-medium text-gray-700">
            phénotype
          </Label>
          <Select value={selectedPh} onValueChange={handlePhChange} name="ph">
                <SelectTrigger className="border-gray-300 focus:border-red-500 focus:ring-red-500">
                  <SelectValue placeholder="Select Phénotype" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">all</SelectItem>
                  <SelectItem value="cceek+">cc ee KEL (+)</SelectItem>
                  <SelectItem value="cceek-">cc ee KEL (-)</SelectItem>
                  <SelectItem value="CcEEk+">Cc EE KEL (+)</SelectItem>
                  <SelectItem value="CcEEk-">Cc EE KEL (-)</SelectItem>
                  <SelectItem value="Cceek+">Cc ee KEL (+)</SelectItem>
                  <SelectItem value="Cceek-">Cc ee KEL (-)</SelectItem>
                  <SelectItem value="CcEek+">Cc Ee KEL (+)</SelectItem>
                  <SelectItem value="CcEek-">Cc Ee KEL (-)</SelectItem>
                  <SelectItem value="CCEEk+">CC EE KEL (+)</SelectItem>
                  <SelectItem value="CCEEk-">CC EE KEL (-)</SelectItem>
                  <SelectItem value="CCeek+">CC ee KEL (+)</SelectItem>
                  <SelectItem value="CCeek-">CC ee KEL (-)</SelectItem>
                  <SelectItem value="ccEEk+">cc EE KEL (+)</SelectItem>
                  <SelectItem value="ccEEk-">cc EE KEL (-)</SelectItem>
                  <SelectItem value="CCEek+">CC Ee KEL (+)</SelectItem>
                  <SelectItem value="CCEek-">CC Ee KEL (-)</SelectItem>
                  <SelectItem value="ccEek+">cc Ee KEL (+)</SelectItem>
                  <SelectItem value="ccEek-">cc Ee KEL (-)</SelectItem>
                </SelectContent>
              </Select>
        </div>

        
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-gray-700">Active Filters</Label>
            <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-red-600 hover:text-red-700">
              <X className="mr-1 h-3 w-3" />
              Clear All
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((filter, index) => (
              <Badge key={index} variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-200">
                {filter}
                <button onClick={() => removeFilter(filter)} className="ml-2 hover:text-red-900">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

"use client"

import React from "react"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Clock, Edit, Calendar, ArrowUpDown } from "lucide-react"
import Link from "next/link"
import { format, differenceInDays, addDays } from "date-fns"
import { DeletePatientButton } from "@/components/delete-patient-button"
import { QuickScheduleDialog } from "@/components/quick-schedule-dialog"
import { useState, useEffect } from "react"

interface PatientListProps {
  searchParams?: {
    search?: string
    category?: string
    bloodType?: string
    gender?: string
  }
}

export function PatientList({ searchParams = {} }: PatientListProps) {
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: "asc" | "desc"
  } | null>(null)

  const fetchPatients = async () => {
    try {
      setLoading(true)
      setError(null)

      // Build query string from search params
      const queryParams = new URLSearchParams()

      if (searchParams.search) {
        queryParams.append("search", searchParams.search)
      }

      if (searchParams.category && searchParams.category !== "All Patients") {
        queryParams.append("category", searchParams.category)
      }

      if (searchParams.bloodType && searchParams.bloodType !== "all") {
        queryParams.append("bloodType", searchParams.bloodType)
      }

      if (searchParams.gender && searchParams.gender !== "all") {
        queryParams.append("gender", searchParams.gender)
      }

      // Fetch patients from API
      const response = await fetch(`/api/patients?${queryParams.toString()}`)

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`)
      }

      const data = await response.json()
      setPatients(data)
    } catch (err) {
      console.error("Error fetching patients:", err)
      setError(err instanceof Error ? err.message : "Failed to load patients")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPatients()
  }, [searchParams])

  const handlePatientDeleted = (deletedPatientId: string) => {
    // Remove the deleted patient from the local state immediately
    setPatients((prevPatients) => prevPatients.filter((patient) => patient._id !== deletedPatientId))
  }

  const requestSort = (key: string) => {
    let direction: "asc" | "desc" = "asc"

    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }

    setSortConfig({ key, direction })
  }

  const sortedPatients = React.useMemo(() => {
    const sortablePatients = [...patients]

    if (sortConfig !== null) {
      sortablePatients.sort((a, b) => {
        if (sortConfig.key === "daysElapsed") {
          const aLastDonationDate = a.lastDonationDate ? new Date(a.lastDonationDate) : null
          const bLastDonationDate = b.lastDonationDate ? new Date(b.lastDonationDate) : null

          const aDaysElapsed = aLastDonationDate ? differenceInDays(new Date(), aLastDonationDate) : -1
          const bDaysElapsed = bLastDonationDate ? differenceInDays(new Date(), bLastDonationDate) : -1

          if (aDaysElapsed < bDaysElapsed) {
            return sortConfig.direction === "asc" ? -1 : 1
          }
          if (aDaysElapsed > bDaysElapsed) {
            return sortConfig.direction === "asc" ? 1 : -1
          }
          return 0
        }

        // For other fields
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1
        }
        return 0
      })
    }

    return sortablePatients
  }, [patients, sortConfig])

  // Function to determine the color based on days elapsed
  const getDaysElapsedColor = (daysElapsed: number | null, type: string) => {
    if (daysElapsed === null) return "bg-gray-100 text-gray-500"

    const absDays = Math.abs(daysElapsed)
    if (type === "HyperRegime"){

      if (absDays >= 15) return "bg-red-500 text-white font-medium"
      if (absDays > 11) return "bg-orange-400 text-white font-medium"
      return "bg-green-500 text-white font-medium"
    }
    if (type === "PolyTransfuses") {
      if (absDays >= 21) return "bg-red-500 text-white font-medium"
      if (absDays > 17) return "bg-orange-400 text-white font-medium"
      return "bg-green-500 text-white font-medium"
    }
    if (type === "Echanges"){
      if (absDays >= 30) return "bg-red-500 text-white font-medium"
      if (absDays > 26) return "bg-orange-400 text-white font-medium"
      return "bg-green-500 text-white font-medium"
    }
    console.log(type)
    return "bg-gray-100 text-gray-500"
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-16 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-400 mb-4">
          <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error loading patients</h3>
        <p className="text-gray-600 mb-4">There was an error loading the patient data. Please try again.</p>
        <Button onClick={fetchPatients} className="bg-red-600 hover:bg-red-700">
          Retry
        </Button>
      </div>
    )
  }

  if (!patients || patients.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No patients found</h3>
        <p className="text-gray-600 mb-4">Try adjusting your search criteria or filters.</p>
        <Link href="/patients/new">
          <Button className="bg-red-600 hover:bg-red-700">Add New Patient</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="font-semibold text-gray-900">NOM ET PRÉNOM</TableHead>
              <TableHead className="font-semibold text-gray-900 text-center">GP</TableHead>
              <TableHead className="font-semibold text-gray-900 text-center">PH</TableHead>
              <TableHead className="font-semibold text-gray-900 text-center">F</TableHead>
              <TableHead className="font-semibold text-gray-900 text-center">C</TableHead>
              <TableHead className="font-semibold text-gray-900 text-center">L</TableHead>
              <TableHead className="font-semibold text-gray-900">DERNIÈRE T</TableHead>
              
              <TableHead
                className="font-semibold text-gray-900 cursor-pointer"
                onClick={() => requestSort("daysElapsed")}
              >
                <div className="flex items-center">
                  J/ÉCOULÉS
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="font-semibold text-gray-900 print:hidden">ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedPatients.map((patient) => {
              // Calculate next transfusion date (90 days after last donation)
              const lastDonationDate = patient.lastDonationDate ? new Date(patient.lastDonationDate) : null
              const nextTransfusionDate = lastDonationDate ? addDays(lastDonationDate, 90) : null

              // Calculate days elapsed
              const daysElapsed = lastDonationDate ? differenceInDays(new Date(), lastDonationDate) : null

              // Get color class for days elapsed
              const daysElapsedColorClass = getDaysElapsedColor(daysElapsed, patient.patientCategory)

              return (
                <TableRow key={patient._id} className="hover:bg-gray-50">
                  <TableCell className="font-medium text-gray-900">
                    {patient.firstName} {patient.lastName}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-gray-700 font-medium">{patient.bloodType}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-gray-700 font-medium">{patient.ph}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    {patient.hasF ? (
                      <div className="w-4 h-4 bg-purple-500 rounded-sm flex items-center justify-center mx-auto">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    ) : (
                      <div className="w-4 h-4 border border-gray-300 rounded-full mx-auto"></div>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {patient.hasC ? (
                      <div className="w-4 h-4 bg-purple-500 rounded-sm flex items-center justify-center mx-auto">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    ) : (
                      <div className="w-4 h-4 border border-gray-300 rounded-full mx-auto"></div>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {patient.hasL ? (
                      <div className="w-4 h-4 bg-purple-500 rounded-sm flex items-center justify-center mx-auto">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    ) : (
                      <div className="w-4 h-4 border border-gray-300 rounded-full mx-auto"></div>
                    )}
                  </TableCell>
                  <TableCell>{patient.lastDonationDate ? format(patient.lastDonationDate, "MMM dd, yyyy") : "N/A"}</TableCell>
                  
                  <TableCell>
                    <div className={`px-2 py-1 rounded text-center ${daysElapsedColorClass}`}>
                      {daysElapsed !== null ? `${Math.abs(daysElapsed)}j` : "N/A"}
                    </div>
                  </TableCell>
                  <TableCell className="print:hidden">
                    <div className="flex items-center space-x-2">
                      <Link href={`/patients/${patient._id}/view`}>
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                          View
                        </Button>
                      </Link>
                      <Link href={`/patients/${patient._id}/edit`}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-50">
                          <Edit className="h-4 w-4 text-blue-600" />
                        </Button>
                      </Link>
                      <QuickScheduleDialog patient={patient}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-green-50">
                          <Calendar className="h-4 w-4 text-green-600" />
                        </Button>
                      </QuickScheduleDialog>
                      <DeletePatientButton patientId={patient._id} onDelete={() => handlePatientDeleted(patient._id)} />
                      <Link href={`/patients/${patient._id}/history`}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-50">
                          <Clock className="h-4 w-4 text-blue-600" />
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600">
        <p>Showing {patients.length} patients</p>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

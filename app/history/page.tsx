"use client"

import { useEffect, useState } from "react"
import Calendar from "react-calendar"
import "react-calendar/dist/Calendar.css"
import { format } from "date-fns"
import {
  Table,
  TableHead,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { useRef } from "react"
import { useReactToPrint } from "react-to-print"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function CalendarHistoryPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const fetchPatients = async (date: Date) => {
    setLoading(true)
  
    const localDate = format(date, "yyyy-MM-dd") 
  
    const res = await fetch(`/api/history?date=${localDate}`)
    const data = await res.json()
    setPatients(data)
    setLoading(false)
  }
  

  useEffect(() => {
    fetchPatients(selectedDate)
  }, [selectedDate])
  
  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6">
      <div className="lg:w-1/3">
        <Calendar
          onChange={(date: Date) => setSelectedDate(date)}
          value={selectedDate}
          className="rounded-lg shadow-md"
        />
      </div>

      <div className="flex-1 space-y-4">
        <h2 className="text-xl font-semibold">
          Patients on {format(selectedDate, "yyyy-MM-dd")}
        </h2>

        {loading && <p>Loading...</p>}
        {!loading && patients.length === 0 && <p>No transfusions found.</p>}
        {!loading && patients.length > 0 && (
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Blood Type</TableHead>
                  <TableHead>Phénotype</TableHead>
                  <TableHead className="text-center">F</TableHead>
                  <TableHead className="text-center">C</TableHead>
                  <TableHead className="text-center">L</TableHead>
                  <TableHead className="text-center">Hb</TableHead>
                  <TableHead className="text-center">Poches</TableHead>
                  <TableHead className="text-center">H.dist</TableHead>
                  <TableHead className="text-center">H.recu</TableHead>
                  
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((transfusion, index) => {
                  const p = transfusion.patient
                  
                  return (
                    <TableRow key={index}>
                      <TableCell>{p.firstName} {p.lastName}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            transfusion.priority === "urgent"
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                          }
                        >
                          {transfusion.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>{p.bloodType}</TableCell>
                      <TableCell>{p.ph || "-"}</TableCell>
                      <TableCell className="text-center">{p.hasF ? "✓" : ""}</TableCell>
                      <TableCell className="text-center">{p.hasC ? "✓" : ""}</TableCell>
                      <TableCell className="text-center">{p.hasL ? "✓" : ""}</TableCell>
                      <TableCell className="text-center">{p.hb ?? "-"}</TableCell>
                      <TableCell className="text-center">{p.poches ?? "-"}</TableCell>
                      <TableCell className="text-center">{p.Hdist ?? "-"}</TableCell>
                      <TableCell className="text-center">{p.Hrecu ?? "-"}</TableCell>
                      <TableCell>{p.description || "-"}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}

      </div>
    </div>
  )
}

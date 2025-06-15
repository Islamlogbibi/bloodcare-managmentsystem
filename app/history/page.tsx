"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getPatientsByDate } from "@/app/lib/actions" 

export default function DailyHistoryPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [patients, setPatients] = useState<any[]>([])

  useEffect(() => {
    const fetchPatients = async () => {
      const formattedDate = format(selectedDate, "yyyy-MM-dd")
      const data = await getPatientsByDate(formattedDate)
      console.log("Fetched patients for date:", formattedDate, data)
      setPatients(data)
    }

    fetchPatients()
  }, [selectedDate])

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold">Daily History</h1>

      <div className="flex flex-col md:flex-row gap-6">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && setSelectedDate(date)}
          className="rounded-md border"
        />

        <div className="flex-1 overflow-x-auto">
          {patients.length === 0 ? (
            <p className="text-gray-500">No history available for this day.</p>
          ) : (
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Blood Type</TableHead>
                  <TableHead>Ph</TableHead>
                  <TableHead>Hb</TableHead>
                  <TableHead>Poches</TableHead>
                  <TableHead>F</TableHead>
                  <TableHead>C</TableHead>
                  <TableHead>L</TableHead>
                  <TableHead>Don</TableHead>
                  <TableHead>Hdist</TableHead>
                  <TableHead>Hrecu</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((p: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{p.firstName || "Unknown"}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          p.priority === "urgent"
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                        }
                      >
                        {p.priority || "regular"}
                      </Badge>
                    </TableCell>
                    <TableCell>{p.bloodType}</TableCell>
                    <TableCell>{p.ph}</TableCell>
                    <TableCell>{p.hb}</TableCell>
                    <TableCell>{p.poches}</TableCell>
                    <TableCell className="text-center">{p.hasF ? "✓" : ""}</TableCell>
                    <TableCell className="text-center">{p.hasC ? "✓" : ""}</TableCell>
                    <TableCell className="text-center">{p.hasL ? "✓" : ""}</TableCell>
                    <TableCell>{p.don}</TableCell>
                    <TableCell>{p.Hdist}</TableCell>
                    <TableCell>{p.Hrecu}</TableCell>
                    <TableCell>{p.status || "-"}</TableCell>
                    <TableCell className="italic text-gray-600">{p.notes || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  )
}

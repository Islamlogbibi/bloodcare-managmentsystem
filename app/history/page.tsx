"use client"

import { useEffect, useRef, useState } from "react"
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
import { useReactToPrint } from "react-to-print"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import PrintStyles from "./style"
import PrintButton from "./button"

export default function CalendarHistoryPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const tableRef = useRef<HTMLDivElement>(null)

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

  const handlePrint = useReactToPrint({
    content: () => tableRef.current,
    documentTitle: `Patients on ${format(selectedDate, "yyyy-MM-dd")}`,
    removeAfterPrint: true,
  })

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
        <div className="no-print flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            Patients on {format(selectedDate, "yyyy-MM-dd")}
          </h2>
          <div className="flex justify-end mb-4 print:hidden">
            <PrintButton />
          </div>
        </div>

        {loading && <p>Loading...</p>}
        {!loading && patients.length === 0 && <p>No transfusions found.</p>}
        {!loading && patients.length > 0 && (
          <div ref={tableRef} className="overflow-x-auto border rounded-lg print:overflow-visible print:rounded-none print:border-none print:p-4">
            <div className="hidden print:block print-header alg">
              <h1>CHU ANNABA SERVICE D'HEMOBIOLOGIE ET TRANSFUSION SANGUINE</h1>
              <h1>CHEF SERVICE PROOF BROUK HACENE</h1>
            </div>
            <div className="hidden print:block print-header">
              <h1>Daily Transfusion Report</h1>
              <p>Blood Transfusion Schedule - </p><h3> {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</h3>
            </div>
            <div className="hidden print:block print-header">
              <strong>Summary:</strong> {patients.length} total commandes
            </div>

            <Table>
              <TableHeader className="bg-gray-50 print:bg-white">
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
                        <Badge className={
                          transfusion.priority === "urgent"
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                        }>
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

            <footer className="mt-4 text-xs text-right print:block">
              {format(new Date(), "Pp")}
            </footer>
          </div>
        )}
      </div>
        <PrintStyles />
        <style jsx global>{`
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          html, body {
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
            background: white !important;
            font-size: 10pt !important;
            line-height: 1.2 !important;
          }

          /* Force full width usage */
          body * {
            visibility: hidden;
          }
          
          .space-y-4, .space-y-4 * {
            visibility: visible;
          }

          .space-y-4 {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            margin: 0 !important;
            padding: 15pt !important;
          }

          @page {
            size: A4 landscape;
            margin: 1cm !important;
            padding: 0 !important;
          }

          /* Hide non-essential elements */
          .print\\:hidden {
            display: none !important;
            visibility: hidden !important;
          }
          
          /* Show print-specific elements */
          .hidden.print\\:block {
            display: block !important;
            visibility: visible !important;
          }
          
          .hidden.print\\:table-cell {
            display: table-cell !important;
            visibility: visible !important;
          }

          /* Print header styling */
          .print-header {
            display: block !important;
            visibility: visible !important;
            text-align: center;
            margin-bottom: 15pt;
            padding-bottom: 8pt;
            border-bottom: 2pt solid #dc2626;
            width: 100%;
          }

          .print-header h1 {
            font-size: 16pt;
            font-weight: bold;
            margin: 0 0 4pt 0;
            color: #dc2626 ;
          }

          .print-header p {
            font-size: 11pt;
            margin: 0;
            color: #374151 !important;
          }
          .alg h1{
            color: black;
          }
          /* Table styling */
          .rounded-lg {
            border-radius: 0 !important;
            width: 100% !important;
            margin: 0 0 10pt 0 !important;
          }

          table {
            width: 100% !important;
            border-collapse: collapse !important;
            table-layout: fixed !important;
            font-size: 8pt !important;
            margin: 0 !important;
          }

          /* Column widths - adjust these based on your content */
          table th:nth-child(1), table td:nth-child(1) { width: 6% !important; } /* H.dist */
          table th:nth-child(2), table td:nth-child(2) { width: 6% !important; } /* H.recu */
          table th:nth-child(3), table td:nth-child(3) { width: 18% !important; } /* Patient */
          table th:nth-child(4), table td:nth-child(4) { width: 8% !important; } /* Blood Type */
          table th:nth-child(5), table td:nth-child(5) { width: 10% !important; } /* Phénotype */
          table th:nth-child(6), table td:nth-child(6) { width: 3% !important; } /* F */
          table th:nth-child(7), table td:nth-child(7) { width: 3% !important; } /* C */
          table th:nth-child(8), table td:nth-child(8) { width: 4% !important; } /* L */
          table th:nth-child(9), table td:nth-child(9) { width: 8% !important; } /* Priority */
          table th:nth-child(10), table td:nth-child(10) { width: 6% !important; } /* poches */
          table th:nth-child(11), table td:nth-child(11) { width: 6% !important; } /* Hb */
          table th:nth-child(12), table td:nth-child(12) { width: 8% !important; } /* Status */
          table th:nth-child(13), table td:nth-child(13) { width: 8% !important; } /* Actions/Attendance */
          table th:nth-child(14), table td:nth-child(14) { width: 6% !important; } /* Actions */

          thead {
            display: table-header-group !important;
          }

          thead th {
            background-color: #f3f4f6 !important;
            border: 1pt solid #d1d5db !important;
            padding: 4pt 2pt !important;
            font-weight: bold !important;
            text-align: left !important;
            font-size: 7pt !important;
            color: #374151 !important;
            vertical-align: middle !important;
            word-wrap: break-word !important;
          }

          tbody td {
            border: 0.5pt solid #e5e7eb !important;
            padding: 3pt 2pt !important;
            vertical-align: middle !important;
            font-size: 7pt !important;
            line-height: 1.1 !important;
            word-wrap: break-word !important;
            overflow: hidden !important;
          }

          tbody tr:nth-child(even) {
            background-color: #f9fafb !important;
          }

          /* Center specific columns */
          td:nth-child(6), td:nth-child(7), td:nth-child(8), 
          td:nth-child(10), td:nth-child(11) {
            text-align: center !important;
          }

          /* Section divider */
          .flex.items-center.my-6 {
            margin: 12pt 0 8pt 0 !important;
            width: 100% !important;
          }

          .flex.items-center.my-6 span {
            font-size: 10pt !important;
            font-weight: bold !important;
            color: #374151 !important;
          }

          /* Hide icons */
          .lucide, svg {
            display: none !important;
          }

          /* Badge styling */
          .bg-red-100, .border-red-200, .text-red-700, .text-red-800 {
            background-color: #fef2f2 !important;
            color: #dc2626 !important;
            border: 1pt solid #fecaca !important;
          }

          .bg-green-100, .text-green-800 {
            background-color: #dcfce7 !important;
            color: #166534 !important;
          }

          .bg-yellow-100, .text-yellow-800 {
            background-color: #fef3c7 !important;
            color: #92400e !important;
          }

          .bg-blue-100, .text-blue-800 {
            background-color: #dbeafe !important;
            color: #1d4ed8 !important;
          }

          .bg-purple-500 {
            background-color: #8b5cf6 !important;
          }

          /* Badges */
          [class*="badge"], [class*="Badge"] {
            font-size: 6pt !important;
            padding: 1pt 3pt !important;
            border-radius: 2pt !important;
            font-weight: normal !important;
          }

          /* Avatar styling */
          .h-8.w-8 {
            width: 16pt !important;
            height: 16pt !important;
            font-size: 6pt !important;
          }

          /* Summary section */
          .flex.items-center.justify-between.text-sm {
            margin-top: 10pt !important;
            font-size: 7pt !important;
            color: #6b7280 !important;
          }

          /* Print summary */
          .print-summary {
            display: block !important;
            visibility: visible !important;
            margin-top: 10pt !important;
            padding-top: 8pt !important;
            border-top: 1pt solid #d1d5db !important;
            font-size: 7pt !important;
            color: #6b7280 !important;
            width: 100% !important;
          }

          /* Force break pages appropriately */
          .rounded-lg.border.border-gray-200:first-of-type {
            page-break-after: avoid;
          }

          /* Ensure proper page breaks */
          tr {
            page-break-inside: avoid;
          }

          /* Remove any containers that might constrain width */
          .container, .max-w-7xl, .mx-auto {
            max-width: none !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  )
}

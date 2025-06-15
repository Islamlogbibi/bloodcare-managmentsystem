"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Clock, Phone, CheckCircle, AlertTriangle, Plus, Printer } from "lucide-react"
import { Edit, Calendar, ArrowUpDown } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useLanguage } from "@/contexts/language-context"
import { useState } from "react"
import { toast } from "@/hooks/use-toast"
import { updateTransfusionStatus } from "@/app/lib/actions"
import { useRouter } from "next/navigation"

interface TodayTransfusionListProps {
  transfusions: any[]
}

export function TodayTransfusionList({ transfusions: initialTransfusions }: TodayTransfusionListProps) {
  const { t } = useLanguage()
  const router = useRouter()
  const [transfusions, setTransfusions] = useState(initialTransfusions)
  const [completingIds, setCompletingIds] = useState<Set<string>>(new Set())

  // Group transfusions by status
  const pendingTransfusions = transfusions.filter((t) => t.status !== "completed")
  const completedTransfusions = transfusions.filter((t) => t.status === "completed")

  const handleMarkAsCompleted = async (transfusionId: string) => {
    setCompletingIds((prev) => new Set(prev).add(transfusionId))

    try {
      await updateTransfusionStatus(transfusionId, "completed")

      // Update local state
      setTransfusions((prev) => prev.map((t) => (t._id === transfusionId ? { ...t, status: "completed" } : t)))

      toast({
        title: t("completed"),
        description: "Transfusion marked as completed successfully.",
      })

      router.refresh()
    } catch (error) {
      console.error("Error updating transfusion status:", error)
      toast({
        title: t("error"),
        description: "Failed to mark transfusion as completed.",
        variant: "destructive",
      })
    } finally {
      setCompletingIds((prev) => {
        const newSet = new Set(prev)
        newSet.delete(transfusionId)
        return newSet
      })
    }
  }

  const handleUnmarkAsCompleted = async (transfusionId: string) => {
    setCompletingIds((prev) => new Set(prev).add(transfusionId))

    try {
      await updateTransfusionStatus(transfusionId, "notcompleted")

      // Update local state
      setTransfusions((prev) => prev.map((t) => (t._id === transfusionId ? { ...t, status: "notcompleted" } : t)))

      toast({
        title: t("completed"),
        description: "Undone completed successfully.",
      })

      router.refresh()
    } catch (error) {
      console.error("Error updating transfusion status:", error)
      toast({
        title: t("error"),
        description: "Failed to undone.",
        variant: "destructive",
      })
    } finally {
      setCompletingIds((prev) => {
        const newSet = new Set(prev)
        newSet.delete(transfusionId)
        return newSet
      })
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (transfusions.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="mx-auto h-16 w-16 text-gray-300" />
        <h3 className="mt-4 text-lg font-semibold text-gray-900">No transfusions scheduled</h3>
        <p className="mt-2 text-gray-600">There are no blood transfusions scheduled for today.</p>
        <Button className="mt-4 bg-red-600 hover:bg-red-700">
          <Plus className="mr-2 h-4 w-4" />
          Schedule Transfusion
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-4 print:hidden">
        <Button variant="outline" onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          Print
        </Button>
      </div>
      <div className="hidden print:block print-header">
        <h1>Daily Transfusion Report</h1>
        <p>Blood Transfusion Schedule - {new Date().toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</p>
      </div>

      {/* Pending Transfusions */}
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="font-semibold text-gray-900">H.dist</TableHead>
              <TableHead className="font-semibold text-gray-900">H.recu</TableHead>
              <TableHead className="font-semibold text-gray-900">Patient</TableHead>
              <TableHead className="font-semibold text-gray-900">Blood Type</TableHead>
              <TableHead className="font-semibold text-gray-900">Phénotype</TableHead>
              <TableHead className="font-semibold text-gray-900">F</TableHead>
              <TableHead className="font-semibold text-gray-900">C</TableHead>
              <TableHead className="font-semibold text-gray-900">L</TableHead>
              <TableHead className="font-semibold text-gray-900">Priority</TableHead>
              <TableHead className="font-semibold text-gray-900">poches</TableHead>
              <TableHead className="font-semibold text-gray-900">Hb</TableHead>
              <TableHead className="font-semibold text-gray-900">Status</TableHead>
              <TableHead className="font-semibold text-gray-900 print:hidden">Actions</TableHead>
              <TableHead className="font-semibold text-gray-900 hidden print:table-cell">Attendance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingTransfusions.map((transfusion) => {
              const initials = `${transfusion.patient.firstName[0]}${transfusion.patient.lastName[0]}`
              const isCompleting = completingIds.has(transfusion._id)

              return (
                <TableRow key={transfusion._id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-900">
                        {transfusion.patient.Hdist}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-900">
                        {transfusion.patient.Hrecu}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-semibold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900">
                          {transfusion.patient.firstName} {transfusion.patient.lastName}
                        </p>
                        <div className="flex items-center text-xs text-gray-500">
                          <Phone className="h-3 w-3 mr-1" />
                          {transfusion.patient.phone}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-semibold border-red-200 text-red-700">
                      {transfusion.patient.bloodType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-semibold border-red-200 text-red-700">
                      {transfusion.patient.ph}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {transfusion.patient.hasF ? (
                      <div className="w-4 h-4 bg-purple-500 rounded-sm flex items-center justify-center mx-auto">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    ) : (
                      <div className="w-4 h-4 border border-gray-300 rounded-full mx-auto"></div>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {transfusion.patient.hasC ? (
                      <div className="w-4 h-4 bg-purple-500 rounded-sm flex items-center justify-center mx-auto">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    ) : (
                      <div className="w-4 h-4 border border-gray-300 rounded-full mx-auto"></div>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {transfusion.patient.hasL ? (
                      <div className="w-4 h-4 bg-purple-500 rounded-sm flex items-center justify-center mx-auto">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    ) : (
                      <div className="w-4 h-4 border border-gray-300 rounded-full mx-auto"></div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        transfusion.priority === "urgent" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
                      }
                    >
                      {transfusion.priority === "urgent" && <AlertTriangle className="h-3 w-3 mr-1" />}
                      {transfusion.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold">
                        
                      {transfusion.patient.poches}
                
                  </TableCell>
                  <TableCell className="font-semibold">
                        
                      {transfusion.patient.hb}
                
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        transfusion.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : transfusion.status === "in-progress"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                      }
                    >
                      {transfusion.status === "completed" && <CheckCircle className="h-3 w-3 mr-1" />}
                      {transfusion.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="print:hidden flex items-center space-x-2">
                    <div className="flex items-center space-x-2">
                      {transfusion.status !== "completed" && (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleMarkAsCompleted(transfusion._id)}
                          disabled={isCompleting}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {isCompleting ? "Loading..." : "Mark as Done"}
                        </Button>
                      )}
                      
                    </div>
                    <div></div>
                    <Link href={`/transfusions/today/${transfusion.patient._id}/edit`}>
                      <Button variant="ghost" size="sm" className="h-8 w-20 p-0 hover:bg-blue-50">
                        <Edit className="h-4 w-4 text-blue-600" /> Edit
                      </Button>
                    </Link>
                  </TableCell>
                  <TableCell className="hidden print:table-cell">
                  <Badge
                    className={
                      transfusion.attended
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }
                  >
                    {transfusion.attended ? "Present" : "Absent"}
                  </Badge>

                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Completed Transfusions */}
      {completedTransfusions.length > 0 && (
        <>
          <div className="flex items-center my-6">
            <div className="flex-grow h-px bg-gray-300"></div>
            <span className="px-4 text-gray-500 font-medium">Completed Transfusions</span>
            <div className="flex-grow h-px bg-gray-300"></div>
          </div>

          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-semibold text-gray-900">H.dist</TableHead>
                  <TableHead className="font-semibold text-gray-900">H.recu</TableHead>
                  <TableHead className="font-semibold text-gray-900">Patient</TableHead>
                  <TableHead className="font-semibold text-gray-900">Blood Type</TableHead>
                  <TableHead className="font-semibold text-gray-900">Phénotype</TableHead>
                  <TableHead className="font-semibold text-gray-900">F</TableHead>
                  <TableHead className="font-semibold text-gray-900">C</TableHead>
                  <TableHead className="font-semibold text-gray-900">L</TableHead>
                  <TableHead className="font-semibold text-gray-900">Priority</TableHead>
                  <TableHead className="font-semibold text-gray-900">poches</TableHead>
                  <TableHead className="font-semibold text-gray-900">Hb</TableHead>
                  <TableHead className="font-semibold text-gray-900">Status</TableHead>
                  <TableHead className="font-semibold text-gray-900 hidden print:table-cell">Attendance</TableHead>
                  <TableHead className="font-semibold text-gray-900 print:hidden">Actions</TableHead>

                </TableRow>
              </TableHeader>
              <TableBody>
                {completedTransfusions.map((transfusion) => {
                  const initials = `${transfusion.patient.firstName[0]}${transfusion.patient.lastName[0]}`
                  const isCompleting = completingIds.has(transfusion._id)
                  return (
                    <TableRow key={transfusion._id} className="hover:bg-gray-50 bg-gray-50/50">
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-900">
                            {transfusion.patient.Hdist}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-900">
                            {transfusion.patient.Hrecu}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-semibold">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900">
                              {transfusion.patient.firstName} {transfusion.patient.lastName}
                            </p>
                            <div className="flex items-center text-xs text-gray-500">
                              <Phone className="h-3 w-3 mr-1" />
                              {transfusion.patient.phone}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-semibold border-red-200 text-red-700">
                          {transfusion.patient.bloodType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-semibold border-red-200 text-red-700">
                          {transfusion.patient.ph}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {transfusion.patient.hasF ? (
                          <div className="w-4 h-4 bg-purple-500 rounded-sm flex items-center justify-center mx-auto">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        ) : (
                          <div className="w-4 h-4 border border-gray-300 rounded-full mx-auto"></div>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {transfusion.patient.hasC ? (
                          <div className="w-4 h-4 bg-purple-500 rounded-sm flex items-center justify-center mx-auto">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        ) : (
                          <div className="w-4 h-4 border border-gray-300 rounded-full mx-auto"></div>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {transfusion.patient.hasL ? (
                          <div className="w-4 h-4 bg-purple-500 rounded-sm flex items-center justify-center mx-auto">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        ) : (
                          <div className="w-4 h-4 border border-gray-300 rounded-full mx-auto"></div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            transfusion.priority === "urgent" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
                          }
                        >
                          {transfusion.priority === "urgent" && <AlertTriangle className="h-3 w-3 mr-1" />}
                          {transfusion.priority}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        
                          {transfusion.patient.poches}
                    
                      </TableCell>
                      <TableCell className="font-semibold">
                        
                          {transfusion.patient.hb}
                    
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {transfusion.status}
                        </Badge>
                      </TableCell>
                      
                      <TableCell className="hidden print:table-cell">
                        <Badge className="bg-green-100 text-green-800">Present</Badge>
                      </TableCell>
                      <TableCell className="print:hidden">
                        <div className="flex items-center space-x-2">
                          {transfusion.status === "completed" && (
                            <Button
                              size="sm"
                              className="bg-red-600 hover:bg-red-700"
                              onClick={() => handleUnmarkAsCompleted(transfusion._id)}
                              disabled={isCompleting}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {isCompleting ? "Loading..." : "Undone"}
                            </Button>
                          )}
                          
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      <div className="flex items-center justify-between text-sm text-gray-600">
        <p>
          Showing {transfusions.length} transfusions scheduled for today
          {completedTransfusions.length > 0 &&
            ` (${completedTransfusions.length} completed, ${pendingTransfusions.length} pending)`}
        </p>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-100 rounded-full"></div>
            <span>Urgent</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-100 rounded-full"></div>
            <span>Regular</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-100 rounded-full"></div>
            <span>Completed</span>
          </div>
        </div>
      </div>
      <div className="hidden print:block print-summary">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong>Summary:</strong> {transfusions.length} total transfusions 
            {completedTransfusions.length > 0 && 
              ` (${completedTransfusions.length} completed, ${pendingTransfusions.length} pending)`
            }
          </div>
          <div style={{ display: 'flex', gap: '15pt' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3pt' }}>
              <div style={{ width: '8pt', height: '8pt', backgroundColor: '#fecaca', borderRadius: '50%' }}></div>
              <span>Urgent</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3pt' }}>
              <div style={{ width: '8pt', height: '8pt', backgroundColor: '#dbeafe', borderRadius: '50%' }}></div>
              <span>Regular</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3pt' }}>
              <div style={{ width: '8pt', height: '8pt', backgroundColor: '#dcfce7', borderRadius: '50%' }}></div>
              <span>Completed</span>
            </div>
          </div>
        </div>
      </div>


      {/* Print-specific styles */}
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
            color: #dc2626 !important;
          }

          .print-header p {
            font-size: 11pt;
            margin: 0;
            color: #374151 !important;
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

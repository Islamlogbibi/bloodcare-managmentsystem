"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Clock, Phone, CheckCircle, AlertTriangle, Plus, Printer } from "lucide-react"
import { format } from "date-fns"
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

      {/* Pending Transfusions */}
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="font-semibold text-gray-900">Time</TableHead>
              <TableHead className="font-semibold text-gray-900">Patient</TableHead>
              <TableHead className="font-semibold text-gray-900">Blood Type</TableHead>
              <TableHead className="font-semibold text-gray-900">Priority</TableHead>
              <TableHead className="font-semibold text-gray-900">Units</TableHead>
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
                        {format(new Date(transfusion.scheduledTime), "HH:mm")}
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
                    <Badge
                      className={
                        transfusion.priority === "urgent" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
                      }
                    >
                      {transfusion.priority === "urgent" && <AlertTriangle className="h-3 w-3 mr-1" />}
                      {transfusion.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-gray-900">{transfusion.bloodUnits} units</span>
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
                  <TableCell className="print:hidden">
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
                      <Button variant="outline" size="sm" className="border-gray-300">
                        View
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="hidden print:table-cell">
                    <Badge className="bg-red-100 text-red-800">Absent</Badge>
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
                  <TableHead className="font-semibold text-gray-900">Time</TableHead>
                  <TableHead className="font-semibold text-gray-900">Patient</TableHead>
                  <TableHead className="font-semibold text-gray-900">Blood Type</TableHead>
                  <TableHead className="font-semibold text-gray-900">Priority</TableHead>
                  <TableHead className="font-semibold text-gray-900">Units</TableHead>
                  <TableHead className="font-semibold text-gray-900">Status</TableHead>
                  <TableHead className="font-semibold text-gray-900 print:hidden">Actions</TableHead>
                  <TableHead className="font-semibold text-gray-900 hidden print:table-cell">Attendance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completedTransfusions.map((transfusion) => {
                  const initials = `${transfusion.patient.firstName[0]}${transfusion.patient.lastName[0]}`

                  return (
                    <TableRow key={transfusion._id} className="hover:bg-gray-50 bg-gray-50/50">
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-900">
                            {format(new Date(transfusion.scheduledTime), "HH:mm")}
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
                        <Badge
                          className={
                            transfusion.priority === "urgent" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
                          }
                        >
                          {transfusion.priority === "urgent" && <AlertTriangle className="h-3 w-3 mr-1" />}
                          {transfusion.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-gray-900">{transfusion.bloodUnits} units</span>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {transfusion.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="print:hidden">
                        <Button variant="outline" size="sm" className="border-gray-300">
                          View
                        </Button>
                      </TableCell>
                      <TableCell className="hidden print:table-cell">
                        <Badge className="bg-green-100 text-green-800">Present</Badge>
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

      {/* Print-specific styles */}
      <style jsx global>{`
        @media print {
          body {
            font-size: 12pt;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          .print\\:table-cell {
            display: table-cell !important;
          }
          
          @page {
            size: portrait;
            margin: 1cm;
          }
          
          h1 {
            font-size: 18pt;
            margin-bottom: 10pt;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            page-break-inside: auto;
          }
          
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          
          thead {
            display: table-header-group;
          }
          
          tfoot {
            display: table-footer-group;
          }
        }
      `}</style>
    </div>
  )
}

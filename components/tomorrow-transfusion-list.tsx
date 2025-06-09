"use client"

import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Clock, Phone } from "lucide-react"
import { format } from "date-fns"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useLanguage } from "@/contexts/language-context"
import { useState } from "react"

interface TomorrowTransfusionListProps {
  transfusions: any[]
}

export function TomorrowTransfusionList({ transfusions: initialTransfusions }: TomorrowTransfusionListProps) {
  const { t } = useLanguage()
  const [transfusions] = useState(initialTransfusions)

  // Group transfusions by status
  const pendingTransfusions = transfusions.filter((t) => t.status !== "completed")
  const completedTransfusions = transfusions.filter((t) => t.status === "completed")

  if (transfusions.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="mx-auto h-16 w-16 text-gray-300" />
        <h3 className="mt-4 text-lg font-semibold text-gray-900">{t("noTransfusionsScheduled")}</h3>
        <p className="mt-2 text-gray-600">{t("noTransfusionsForTomorrow")}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Pending Transfusions */}
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="font-semibold text-gray-900">{t("time")}</TableHead>
              <TableHead className="font-semibold text-gray-900">{t("patient")}</TableHead>
              <TableHead className="font-semibold text-gray-900">{t("bloodType")}</TableHead>
              <TableHead className="font-semibold text-gray-900">{t("priority")}</TableHead>
              
              <TableHead className="font-semibold text-gray-900">{t("contact")}</TableHead>
              <TableHead className="font-semibold text-gray-900 hidden print:table-cell">{t("attendance")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingTransfusions.map((transfusion) => {
              const initials = `${transfusion.patient.firstName[0]}${transfusion.patient.lastName[0]}`

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
                        <p className="text-xs text-gray-500">ID: {transfusion.patient._id.slice(-6).toUpperCase()}</p>
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
                      {transfusion.priority}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center text-xs text-gray-500">
                      <Phone className="h-3 w-3 mr-1" />
                      {transfusion.patient.phone}
                    </div>
                  </TableCell>
                  <TableCell className="hidden print:table-cell">
                    <Badge className="bg-red-100 text-red-800">{t("absent")}</Badge>
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
            <span className="px-4 text-gray-500 font-medium">{t("completedTransfusions")}</span>
            <div className="flex-grow h-px bg-gray-300"></div>
          </div>

          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-semibold text-gray-900">{t("time")}</TableHead>
                  <TableHead className="font-semibold text-gray-900">{t("patient")}</TableHead>
                  <TableHead className="font-semibold text-gray-900">{t("bloodType")}</TableHead>
                  <TableHead className="font-semibold text-gray-900">{t("priority")}</TableHead>
                  
                  <TableHead className="font-semibold text-gray-900">{t("contact")}</TableHead>
                  <TableHead className="font-semibold text-gray-900 hidden print:table-cell">
                    {t("attendance")}
                  </TableHead>
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
                            <p className="text-xs text-gray-500">
                              ID: {transfusion.patient._id.slice(-6).toUpperCase()}
                            </p>
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
                          {transfusion.priority}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center text-xs text-gray-500">
                          <Phone className="h-3 w-3 mr-1" />
                          {transfusion.patient.phone}
                        </div>
                      </TableCell>
                      <TableCell className="hidden print:table-cell">
                        <Badge className="bg-green-100 text-green-800">{t("present")}</Badge>
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
          {t("showingTransfusions", { count: transfusions.length })}
          {completedTransfusions.length > 0 &&
            ` (${completedTransfusions.length} ${t("completed")}, ${pendingTransfusions.length} ${t("pending")})`}
        </p>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-100 rounded-full"></div>
            <span>{t("urgent")}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-100 rounded-full"></div>
            <span>{t("regular")}</span>
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

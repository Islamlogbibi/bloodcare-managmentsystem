"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Filter } from "lucide-react"
import Link from "next/link"
import { PatientList } from "@/components/patient-list"
import { PatientFilters } from "@/components/patient-filters"
import { PatientPageActions } from "@/components/patient-page-actions"

interface PatientsPageProps {
  searchParams: {
    search?: string
    category?: string
    bloodType?: string
    gender?: string
  }
}

export default function PatientsPage({ searchParams }: PatientsPageProps) {
  return (
    <div className="min-h-screen bg-gray-50/50 print:min-h-0 print:h-auto print:overflow-visible print:bg-white">
      <div className="flex-1 space-y-6 p-6 print:p-0 print:space-y-0">
        {/* Header and Add button - HIDDEN IN PRINT */}
        <div className="flex items-center justify-between print:hidden">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Patient Records</h1>
            <p className="text-gray-600 mt-1">Manage all patient blood donation records</p>
          </div>
          <div className="flex items-center space-x-3">
            <PatientPageActions searchParams={searchParams} />
            <Link href="/patients/new">
              <Button className="bg-red-600 hover:bg-red-700">
                <Plus className="mr-2 h-4 w-4" />
                Add Patient
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters (HIDDEN IN PRINT) */}
        <Card className="border-0 shadow-md print:hidden">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-gray-900">Search & Filter Patients</CardTitle>
                <CardDescription>Use filters to find specific patients quickly</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="border-gray-300">
                <Filter className="mr-2 h-4 w-4" />
                Advanced Filters
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <PatientFilters />
          </CardContent>
        </Card>

        {/* Patient Table Only (Print this) */}
        <div className="print-area">
          <Card className="border-0 shadow-md print:shadow-none print:border-0">
            <CardHeader className="print:hidden">
              <CardTitle className="text-gray-900">Patient Directory</CardTitle>
              <CardDescription>Complete list of registered patients</CardDescription>
            </CardHeader>
            <CardContent>
              <PatientList searchParams={searchParams} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Print-specific styles */}
      <style jsx global>{`
@media print {
  body {
    font-size: 11pt;
    background: white !important;
    color: black !important;
  }

  /* Hide non-essential elements */
  .print\:hidden,
  .print\\:hidden {
    display: none !important;
  }

  /* Ensure print area is visible */
  .print-area {
    display: block !important;
    width: 100%;
  }

  .print-area * {
    visibility: visible !important;
  }

  /* Page setup */
  @page {
    size: landscape;
    margin: 1.5cm 1cm;
  }

  /* Add a print header */
  .print-area::before {
    content: "BloodCare - Patient Records Report";
    display: block;
    font-size: 16pt;
    font-weight: bold;
    text-align: center;
    margin-bottom: 20pt;
    border-bottom: 2pt solid #dc2626;
    padding-bottom: 10pt;
  }

  /* Table styling */
  table {
    width: 100% !important;
    border-collapse: collapse;
    page-break-inside: auto;
    font-size: 10pt;
  }

  /* Enhanced table headers */
  thead {
    display: table-header-group;
  }

  thead th {
    background-color: #f3f4f6 !important;
    border: 1pt solid #d1d5db !important;
    padding: 8pt 4pt !important;
    font-weight: bold !important;
    text-align: left !important;
    font-size: 9pt !important;
  }

  /* Table cells */
  tbody td {
    border: 1pt solid #e5e7eb !important;
    padding: 6pt 4pt !important;
    vertical-align: top !important;
  }

  /* Zebra striping for better readability */
  tbody tr:nth-child(even) {
    background-color: #f9fafb !important;
  }

  /* Page break controls */
  tr {
    page-break-inside: avoid;
    page-break-after: auto;
  }

  thead {
    page-break-after: avoid;
  }

  /* Blood type styling - make them stand out */
  td:nth-child(2) { /* Assuming blood type is 2nd column */
    font-weight: bold !important;
    color: #dc2626 !important;
  }

  /* Date formatting */
  td:nth-child(6) { /* Assuming date is 6th column */
    white-space: nowrap !important;
  }

  /* Footer with page numbers and timestamp */
  @page {
    @bottom-center {
      content: "Page " counter(page) " of " counter(pages);
      font-size: 9pt;
      color: #6b7280;
    }
    
    @bottom-right {
      content: "Printed: " date();
      font-size: 9pt;
      color: #6b7280;
    }
  }

  /* Compact spacing for more data per page */
  .compact-print tbody td {
    padding: 4pt 3pt !important;
    font-size: 9pt !important;
    line-height: 1.2 !important;
  }

  .compact-print thead th {
    padding: 6pt 3pt !important;
    font-size: 8pt !important;
  }

  /* Status indicators (if you have status columns) */
  .status-active {
    color: #059669 !important;
    font-weight: bold !important;
  }

  .status-inactive {
    color: #dc2626 !important;
  }

  /* Ensure checkmarks and symbols print correctly */
  .checkmark::after {
    content: "✓";
    color: #059669 !important;
  }

  /* Hide pagination controls */
  .pagination,
  [class*="pagination"],
  .page-info {
    display: none !important;
  }

  /* Summary section at the bottom */
  .print-summary {
    margin-top: 20pt;
    padding-top: 10pt;
    border-top: 1pt solid #d1d5db;
    font-size: 9pt;
    color: #6b7280;
  }
}

/* Optional: Add a print button with custom styling */
.print-button {
  background-color: #dc2626;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.print-button:hover {
  background-color: #b91c1c;
}

@media print {
  .print-button {
    display: none !important;
  }
}
      `}</style>
    </div>
  )
}

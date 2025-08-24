'use client'

export function PrintStyles() {
  return (
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
  )
}

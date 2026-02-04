"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Clock, Phone, CheckCircle, AlertTriangle, Plus, Printer } from "lucide-react"
import { format } from "date-fns"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useLanguage } from "@/contexts/language-context"
import { deleteTransfusionById } from "@/app/lib/actions"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { useState } from "react"

interface TomorrowTransfusionListProps {
  transfusions: any[]
}

export function TomorrowTransfusionList({ transfusions: initialTransfusions }: TomorrowTransfusionListProps) {
  const { t } = useLanguage()
  const [transfusions, setTransfusions] = useState(initialTransfusions)
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Grouper les transfusions par statut
  const pendingTransfusions = transfusions.filter((t) => t.status !== "completed")
  const completedTransfusions = transfusions.filter((t) => t.status === "completed")
  const handleRemove = async (transfusionId: string) => {
    const confirm = window.confirm("Êtes-vous sûr de vouloir supprimer cette transfusion ?")
    if (!confirm) return

    setDeletingId(transfusionId)
    try {
      await deleteTransfusionById(transfusionId)
      setTransfusions((prev) => prev.filter((t) => t._id !== transfusionId))
      toast({
        title: "Supprimé",
        description: "Transfusion supprimée avec succès.",
      })
      router.refresh()
    } catch (err) {
      console.error("Failed to delete transfusion:", err)
      toast({
        title: "Erreur",
        description: "Échec de la suppression de la transfusion.",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }
  const handlePrint = () => {
    window.print()
  }
  
  if (transfusions.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="mx-auto h-16 w-16 text-gray-300" />
        <h3 className="mt-4 text-lg font-semibold text-gray-900">Aucune transfusion programmée</h3>
        <p className="mt-2 text-gray-600">Il n'y a pas de transfusions sanguines programmées pour demain.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-4 print:hidden">
        <Button variant="outline" onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          Imprimer
        </Button>
      </div>
      <div className="hidden print:block print-header alg">
        <h1>CHU ANNABA SERVICE D'HÉMOBIOLOGIE ET TRANSFUSION SANGUINE</h1>
        <h1>CHEF DE SERVICE PR. BROUK HACENE</h1>
      </div>
      <div className="hidden print:block print-header">
        <h1>Rapport quotidien des transfusions</h1>
        <p>Programme des transfusions sanguines - </p>
        <h3>
          {" "}
          {new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR', { 
            weekday: 'long',
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </h3>
      </div>
      
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="font-semibold text-gray-900">Patient</TableHead>
              <TableHead className="font-semibold text-gray-900">Groupe sanguin</TableHead>
              <TableHead className="font-semibold text-gray-900">Phénotype</TableHead>
              <TableHead className="font-semibold text-gray-900">F</TableHead>
              <TableHead className="font-semibold text-gray-900">C</TableHead>
              <TableHead className="font-semibold text-gray-900">L</TableHead>
              <TableHead className="font-semibold text-gray-900">Contact</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingTransfusions.map((transfusion) => {
              const initials = `${transfusion.patient.firstName[0]}${transfusion.patient.lastName[0]}`

              return (
                <TableRow key={transfusion._id} className="hover:bg-gray-50">
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
                    <div className="flex items-center text-xs text-gray-500">
                      <Phone className="h-3 w-3 mr-1" />
                      {transfusion.patient.phone}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemove(transfusion._id)}
                    >
                      Supprimer
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Styles spécifiques à l'impression */}
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

          /* Forcer l'utilisation de toute la largeur */
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

          /* Masquer les éléments non essentiels */
          .print\\:hidden {
            display: none !important;
            visibility: hidden !important;
          }
          
          /* Afficher les éléments spécifiques à l'impression */
          .hidden.print\\:block {
            display: block !important;
            visibility: visible !important;
          }
          
          .hidden.print\\:table-cell {
            display: table-cell !important;
            visibility: visible !important;
          }

          /* Style de l'en-tête d'impression */
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
          /* Style des tableaux */
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

          /* Largeurs des colonnes - à ajuster selon votre contenu */
          table th:nth-child(1), table td:nth-child(1) { width: 25% !important; } /* Patient */
          table th:nth-child(2), table td:nth-child(2) { width: 8% !important; } /* Groupe sanguin */
          table th:nth-child(3), table td:nth-child(3) { width: 10% !important; } /* Phénotype */
          table th:nth-child(4), table td:nth-child(4) { width: 5% !important; } /* F */
          table th:nth-child(5), table td:nth-child(5) { width: 5% !important; } /* C */
          table th:nth-child(6), table td:nth-child(6) { width: 5% !important; } /* L */
          table th:nth-child(7), table td:nth-child(7) { width: 25% !important; } /* Contact */

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

          /* Centrer des colonnes spécifiques */
          td:nth-child(4), td:nth-child(5), td:nth-child(6) {
            text-align: center !important;
          }

          /* Séparateur de section */
          .flex.items-center.my-6 {
            margin: 12pt 0 8pt 0 !important;
            width: 100% !important;
          }

          .flex.items-center.my-6 span {
            font-size: 10pt !important;
            font-weight: bold !important;
            color: #374151 !important;
          }

          /* Masquer les icônes */
          .lucide, svg {
            display: none !important;
          }

          /* Style des badges */
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

          /* Style des avatars */
          .h-8.w-8 {
            width: 16pt !important;
            height: 16pt !important;
            font-size: 6pt !important;
          }

          /* Section de résumé */
          .flex.items-center.justify-between.text-sm {
            margin-top: 10pt !important;
            font-size: 7pt !important;
            color: #6b7280 !important;
          }

          /* Résumé d'impression */
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

          /* Forcer les sauts de page appropriés */
          .rounded-lg.border.border-gray-200:first-of-type {
            page-break-after: avoid;
          }

          /* Assurer les sauts de page appropriés */
          tr {
            page-break-inside: avoid;
          }

          /* Supprimer les conteneurs qui pourraient contraindre la largeur */
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
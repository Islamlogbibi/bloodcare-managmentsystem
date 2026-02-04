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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { PlusCircle, Search, Loader2, Trash2 } from "lucide-react"
import PrintStyles from "./style"
import PrintButton from "./button"

export default function CalendarHistoryPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  
  // New states for patient selection and history entry
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [allPatients, setAllPatients] = useState<any[]>([])
  const [selectedPatientId, setSelectedPatientId] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  
  // Form fields for history entry
  const [formData, setFormData] = useState({
    priority: "normal",
    hb: "",
    poches: "",
    Hdist: "",
    Hrecu: "",
    description: "",
    hasF: false,
    hasC: false,
    hasL: false,
  })

  const tableRef = useRef<HTMLDivElement>(null)

  const fetchPatients = async (date: Date) => {
    setLoading(true)
    try {
      const localDate = format(date, "yyyy-MM-dd")
      const res = await fetch(`/api/history?date=${localDate}`)
      const data = await res.json()
      setPatients(data)
    } catch (error) {
      console.error("Error fetching history:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAllPatients = async () => {
    try {
      const res = await fetch("/api/patients")
      const data = await res.json()
      setAllPatients(data)
    } catch (error) {
      console.error("Error fetching patients:", error)
    }
  }

  useEffect(() => {
    fetchPatients(selectedDate)
    fetchAllPatients()
  }, [selectedDate])

  const handlePrint = useReactToPrint({
    content: () => tableRef.current,
    documentTitle: `Patients du ${format(selectedDate, "yyyy-MM-dd")}`,
    removeAfterPrint: true,
  })

  const handleAddHistory = async () => {
    if (!selectedPatientId) return
    
    setIsSubmitting(true)
    try {
      const payload = {
        patientId: selectedPatientId,
        date: format(selectedDate, "yyyy-MM-dd"),
        ...formData,
      }
      
      const res = await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      
      if (res.ok) {
        setIsModalOpen(false)
        fetchPatients(selectedDate)
        // Reset form
        setSelectedPatientId("")
        setFormData({
          priority: "normal",
          hb: "",
          poches: "",
          Hdist: "",
          Hrecu: "",
          description: "",
          hasF: false,
          hasC: false,
          hasL: false,
        })
      }
    } catch (error) {
      console.error("Error adding history:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteTransfusion = async (transfusionId: string) => {
    setDeletingId(transfusionId)
    try {
      const res = await fetch(`/api/history/${transfusionId}`, {
        method: "DELETE",
      })
      
      if (res.ok) {
        fetchPatients(selectedDate)
      }
    } catch (error) {
      console.error("Error deleting transfusion:", error)
    } finally {
      setDeletingId(null)
    }
  }

  const filteredPatients = allPatients.filter(p => 
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6">

      <div className="lg:w-1/3 space-y-4 print:hidden">
        <Calendar
          onChange={(date: Date) => setSelectedDate(date)}
          value={selectedDate}
          className="rounded-lg shadow-md w-full"
        />
        
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="w-full flex items-center gap-2 bg-transparent" variant="outline">
              <PlusCircle className="w-4 h-4" />
              Ajouter un patient pour ce jour
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Ajouter une transfusion - {format(selectedDate, "dd/MM/yyyy")}</DialogTitle>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Sélectionner un patient</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un patient..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredPatients.map((p) => (
                      <SelectItem key={p._id} value={p._id}>
                        {p.firstName} {p.lastName} ({p.bloodType})
                      </SelectItem>
                    ))}
                    {filteredPatients.length === 0 && (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        Aucun patient trouvé
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Priorité</Label>
                  <Select 
                    value={formData.priority} 
                    onValueChange={(v) => setFormData({...formData, priority: v})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normale</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Hb (g/dL)</Label>
                  <Input 
                    type="text" 
                    value={formData.hb} 
                    onChange={(e) => setFormData({...formData, hb: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Poches</Label>
                  <Input 
                    type="text" 
                    value={formData.poches} 
                    onChange={(e) => setFormData({...formData, poches: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>H.dist</Label>
                  <Input 
                    type="text" 
                    value={formData.Hdist} 
                    onChange={(e) => setFormData({...formData, Hdist: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>H.reçu</Label>
                  <Input 
                    type="text" 
                    value={formData.Hrecu} 
                    onChange={(e) => setFormData({...formData, Hrecu: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-6 py-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="hasF" 
                    checked={formData.hasF} 
                    onCheckedChange={(checked) => setFormData({...formData, hasF: !!checked})} 
                  />
                  <Label htmlFor="hasF">F</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="hasC" 
                    checked={formData.hasC} 
                    onCheckedChange={(checked) => setFormData({...formData, hasC: !!checked})} 
                  />
                  <Label htmlFor="hasC">C</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="hasL" 
                    checked={formData.hasL} 
                    onCheckedChange={(checked) => setFormData({...formData, hasL: !!checked})} 
                  />
                  <Label htmlFor="hasL">L</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description / Notes</Label>
                <Textarea 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>Annuler</Button>
              <Button 
                type="button"
                onClick={handleAddHistory} 
                disabled={!selectedPatientId || isSubmitting}
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enregistrer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex-1 space-y-4">
        <div className="no-print flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            Patients du {format(selectedDate, "yyyy-MM-dd")}
          </h2>
          <div className="flex justify-end mb-4 print:hidden">
            <PrintButton />
          </div>
        </div>

        {loading && <p>Chargement...</p>}
        {!loading && patients.length === 0 && <p>Aucune transfusion trouvée.</p>}
        {!loading && patients.length > 0 && (
          <div ref={tableRef} className="space-y-4">
            <div className="hidden print:block print-header alg">
              <h1>CHU ANNABA SERVICE D'HÉMOBIOLOGIE ET TRANSFUSION SANGUINE</h1>
              <h1>CHEF DE SERVICE PR. BROUK HACENE</h1>
            </div>
            <div className="hidden print:block print-header">
              <h1>Rapport quotidien des transfusions</h1>
              <p>Programme des transfusions sanguines - </p>
              <h3>
                {selectedDate.toLocaleDateString("fr-FR", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </h3>
            </div>
            <div className="hidden print:block print-header">
              <strong>Résumé :</strong> {patients.length} commandes au total
            </div>

            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="font-semibold text-gray-900">H.dist</TableHead>
                    <TableHead className="font-semibold text-gray-900">H.reçu</TableHead>
                    <TableHead className="font-semibold text-gray-900">Patient</TableHead>
                    <TableHead className="font-semibold text-gray-900">Groupe sanguin</TableHead>
                    <TableHead className="font-semibold text-gray-900">Phénotype</TableHead>
                    <TableHead className="font-semibold text-gray-900">F</TableHead>
                    <TableHead className="font-semibold text-gray-900">C</TableHead>
                    <TableHead className="font-semibold text-gray-900">L</TableHead>
                    <TableHead className="font-semibold text-gray-900">Priorité</TableHead>
                    <TableHead className="font-semibold text-gray-900">Poches</TableHead>
                    <TableHead className="font-semibold text-gray-900">Hb</TableHead>
                    <TableHead className="font-semibold text-gray-900">Don</TableHead>
                    <TableHead className="font-semibold text-gray-900 print:hidden">Actions</TableHead>
                    <TableHead className="font-semibold text-gray-900 hidden print:table-cell">Présence</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patients.map((transfusion, index) => {
                    const p = transfusion.patient
                    
                    // Helper function to get value from transfusion first, fallback to patient
                    const getValue = (transfusionValue: any, patientValue: any) => {
                      return (transfusionValue !== undefined && transfusionValue !== null && transfusionValue !== "") 
                        ? transfusionValue 
                        : patientValue
                    }
                    
                    // Get values with fallback
                    const hdist = getValue(transfusion.Hdist, p.Hdist)
                    const hrecu = getValue(transfusion.Hrecu, p.Hrecu)
                    const hb = getValue(transfusion.hb, p.hb)
                    const poches = getValue(transfusion.poches, p.poches)
                    const hasF = transfusion.hasF !== undefined ? transfusion.hasF : p.hasF
                    const hasC = transfusion.hasC !== undefined ? transfusion.hasC : p.hasC
                    const hasL = transfusion.hasL !== undefined ? transfusion.hasL : p.hasL
                    
                    return (
                      <TableRow key={transfusion._id || index}>
                        <TableCell>{hdist || "-"}</TableCell>
                        <TableCell>{hrecu || "-"}</TableCell>
                        <TableCell>{p.firstName} {p.lastName}</TableCell>
                        <TableCell>{p.bloodType}</TableCell>
                        <TableCell>{p.ph || "-"}</TableCell>
                        <TableCell className="text-center">{hasF ? "✓" : ""}</TableCell>
                        <TableCell className="text-center">{hasC ? "✓" : ""}</TableCell>
                        <TableCell className="text-center">{hasL ? "✓" : ""}</TableCell>
                        <TableCell>
                          <Badge className={
                            transfusion.priority === "urgent"
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                          }>
                            {transfusion.priority === "urgent" ? "urgente" : "normale"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">{poches || "-"}</TableCell>
                        <TableCell className="text-center">{hb || "-"}</TableCell>
                        <TableCell>{transfusion.description || "-"}</TableCell>
                        <TableCell className="print:hidden">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                disabled={deletingId === transfusion._id}
                              >
                                {deletingId === transfusion._id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Êtes-vous sûr de vouloir supprimer cette transfusion pour {p.firstName} {p.lastName} ? Cette action est irréversible.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 hover:bg-red-700"
                                  onClick={() => handleDeleteTransfusion(transfusion._id)}
                                >
                                  Supprimer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                        <TableCell className="hidden print:table-cell">
                          ___
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
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

          /* Force body content to be visible */
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

          /* Hide print utility classes */
          .print\:hidden {
            display: none !important;
            visibility: hidden !important;
          }
          
          .hidden.print\:block {
            display: block !important;
            visibility: visible !important;
          }
          
          .hidden.print\:table-cell {
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
            color: #dc2626;
          }

          .print-header h3 {
            font-size: 14pt;
            font-weight: bold;
            margin: 4pt 0 0 0;
            color: #dc2626;
          }

          .print-header p {
            font-size: 11pt;
            margin: 0;
            color: #374151 !important;
          }

          .alg h1 {
            color: black !important;
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

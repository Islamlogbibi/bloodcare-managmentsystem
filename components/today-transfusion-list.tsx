"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Clock, Phone, CheckCircle, AlertTriangle, Plus, Printer, Search, ChevronUp, ChevronDown } from "lucide-react"
import { Edit } from "lucide-react"
import { deleteTransfusionById } from "@/app/lib/actions"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useLanguage } from "@/contexts/language-context"
import { useState, useMemo } from "react"
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
  const [searchQuery, setSearchQuery] = useState("")
  const [hbSortOrder, setHbSortOrder] = useState<"asc" | "desc" | null>(null)

  const filteredTransfusions = useMemo(() => {
    let filtered = transfusions

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter((transfusion) => {
        const fullName = `${transfusion.patient.firstName} ${transfusion.patient.lastName}`.toLowerCase()
        return fullName.includes(query)
      })
    }

    if (hbSortOrder) {
      filtered = [...filtered].sort((a, b) => {
        // Fallback: use transfusion hb if available, else patient hb
        const hbAVal = a.hb || a.patient.hb
        const hbBVal = b.hb || b.patient.hb
        const hbA = Number.parseFloat(hbAVal) || 0
        const hbB = Number.parseFloat(hbBVal) || 0

        if (hbSortOrder === "asc") {
          return hbA - hbB
        } else {
          return hbB - hbA
        }
      })
    }

    return filtered
  }, [transfusions, searchQuery, hbSortOrder])

  const handleHbSort = () => {
    if (hbSortOrder === null) {
      setHbSortOrder("asc")
    } else if (hbSortOrder === "asc") {
      setHbSortOrder("desc")
    } else {
      setHbSortOrder(null)
    }
  }

  // Group filtered transfusions by status
  const pendingTransfusions = filteredTransfusions.filter((t) => t.status !== "completed")
  const completedTransfusions = filteredTransfusions.filter((t) => t.status === "completed")
  const urgentorders = filteredTransfusions.filter((t) => t.priority === "urgent")
  const regularorders = filteredTransfusions.filter((t) => t.priority === "regular")

  const handleMarkAsCompleted = async (transfusionId: string) => {
    setCompletingIds((prev) => new Set(prev).add(transfusionId))

    try {
      await updateTransfusionStatus(transfusionId, "completed")

      // Update local state
      setTransfusions((prev) => prev.map((t) => (t._id === transfusionId ? { ...t, status: "completed" } : t)))

      toast({
        title: "Terminé",
        description: "Transfusion marquée comme terminée avec succès.",
      })

      router.refresh()
    } catch (error) {
      console.error("Error updating transfusion status:", error)
      toast({
        title: "Erreur",
        description: "Échec de marquage de la transfusion comme terminée.",
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
        title: "Annulé",
        description: "Marquage terminé annulé avec succès.",
      })

      router.refresh()
    } catch (error) {
      console.error("Error updating transfusion status:", error)
      toast({
        title: "Erreur",
        description: "Échec de l'annulation.",
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
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (transfusionId: string) => {
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
        <p className="mt-2 text-gray-600">Il n'y a pas de transfusions sanguines programmées pour aujourd'hui.</p>
        <Button className="mt-4 bg-red-600 hover:bg-red-700">
          <Plus className="mr-2 h-4 w-4" />
          Programmer une transfusion
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4 print:hidden">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Rechercher par nom du patient..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          Imprimer
        </Button>
      </div>

      {searchQuery.trim() && (
        <div className="text-sm text-gray-600 mb-4 print:hidden">
          Affichage de {filteredTransfusions.length} sur {transfusions.length} transfusions correspondant à "{searchQuery}"
        </div>
      )}

      <div className="hidden print:block print-header alg">
        <h1>CHU ANNABA SERVICE D'HÉMOBIOLOGIE ET TRANSFUSION SANGUINE</h1>
        <h1>CHEF DE SERVICE PR. BROUK HACENE</h1>
      </div>
      <div className="hidden print:block print-header">
        <h1>Rapport quotidien des transfusions</h1>
        <p>Programme des transfusions sanguines - </p>
        <h3>
          {" "}
          {new Date().toLocaleDateString("fr-FR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </h3>
      </div>
      <div className="hidden print:block print-header">
        <strong>Résumé :</strong> {filteredTransfusions.length} commandes au total
        {completedTransfusions.length > 0 && <span> ({completedTransfusions.length} commandes distribuées)</span>}
      </div>

      {/* Transfusions en attente */}
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
              <TableHead
                className="font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 select-none print:cursor-default print:hover:bg-gray-50"
                onClick={handleHbSort}
              >
                <div className="flex items-center gap-1">
                  Hb
                  <div className="flex flex-col print:hidden">
                    <ChevronUp className={`h-3 w-3 ${hbSortOrder === "asc" ? "text-blue-600" : "text-gray-400"}`} />
                    <ChevronDown
                      className={`h-3 w-3 -mt-1 ${hbSortOrder === "desc" ? "text-blue-600" : "text-gray-400"}`}
                    />
                  </div>
                </div>
              </TableHead>
              <TableHead className="font-semibold text-gray-900">Don</TableHead>
              <TableHead className="font-semibold text-gray-900 print:hidden">Actions</TableHead>
              <TableHead className="font-semibold text-gray-900 hidden print:table-cell">Présence</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {regularorders.map((transfusion) => {
              const initials = `${transfusion.patient.firstName[0]}${transfusion.patient.lastName[0]}`
              const isCompleting = completingIds.has(transfusion._id)

              return (
                <TableRow key={transfusion._id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{transfusion.patient.Hdist}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{transfusion.patient.Hrecu}</span>
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
                  {(() => {
                    // Fallback logic: use transfusion data if available, else use patient data
                    const hasF = transfusion.hasF !== undefined ? transfusion.hasF : transfusion.patient.hasF
                    const hasC = transfusion.hasC !== undefined ? transfusion.hasC : transfusion.patient.hasC
                    const hasL = transfusion.hasL !== undefined ? transfusion.hasL : transfusion.patient.hasL
                    const poches = transfusion.poches || transfusion.patient.poches
                    const hb = transfusion.hb || transfusion.patient.hb
                    const description = transfusion.description || transfusion.patient.don
                    
                    return (
                      <>
                        <TableCell className="text-center">
                          {hasF ? (
                            <div className="w-4 h-4 bg-purple-500 rounded-sm flex items-center justify-center mx-auto">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          ) : (
                            <div className="w-4 h-4 border border-gray-300 rounded-full mx-auto"></div>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {hasC ? (
                            <div className="w-4 h-4 bg-purple-500 rounded-sm flex items-center justify-center mx-auto">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          ) : (
                            <div className="w-4 h-4 border border-gray-300 rounded-full mx-auto"></div>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {hasL ? (
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
                            {transfusion.priority === "urgent" ? "Urgent" : "Normal"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold">{poches}</TableCell>
                        <TableCell className="font-semibold">{hb}</TableCell>
                        <TableCell>{description}</TableCell>
                      </>
                    )
                  })()}
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
                          {isCompleting ? "Chargement..." : "Marquer terminé"}
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {transfusion.status === "completed" && (
                        <Button
                          size="sm"
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => handleUnmarkAsCompleted(transfusion._id)}
                          disabled={isCompleting}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {isCompleting ? "Chargement..." : "Annuler"}
                        </Button>
                      )}
                    </div>
                    <div></div>
                    <Link href={`/transfusions/today/${transfusion.patient._id}/edit`}>
                      <Button variant="ghost" size="sm" className="h-8 w-20 p-0 hover:bg-blue-50">
                        <Edit className="h-4 w-4 text-blue-600" /> Modifier
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(transfusion._id)}
                      className="h-8 w-20"
                      disabled={deletingId === transfusion._id}
                    >
                      {deletingId === transfusion._id ? "..." : "Supprimer"}
                    </Button>
                  </TableCell>
                  <TableCell className="hidden print:table-cell">
                    <Badge
                      className={
                        transfusion.status === "completed" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }
                    >
                      {transfusion.status === "completed" ? "Présent" : "Absent"}
                    </Badge>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Transfusions terminées */}
      {completedTransfusions.length >= 0 && (
        <>
          <div className="flex items-center my-6">
            <div className="flex-grow h-px bg-gray-300"></div>
            <span className="px-4 text-gray-500 font-medium">Transfusions urgentes</span>
            <div className="flex-grow h-px bg-gray-300"></div>
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
                  <TableHead
                    className="font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 select-none print:cursor-default print:hover:bg-gray-50"
                    onClick={handleHbSort}
                  >
                    <div className="flex items-center gap-1">
                      Hb
                      <div className="flex flex-col print:hidden">
                        <ChevronUp className={`h-3 w-3 ${hbSortOrder === "asc" ? "text-blue-600" : "text-gray-400"}`} />
                        <ChevronDown
                          className={`h-3 w-3 -mt-1 ${hbSortOrder === "desc" ? "text-blue-600" : "text-gray-400"}`}
                        />
                      </div>
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">Don</TableHead>
                  <TableHead className="font-semibold text-gray-900 hidden print:table-cell">Présence</TableHead>
                  <TableHead className="font-semibold text-gray-900 print:hidden">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {urgentorders.map((transfusion) => {
                  const initials = `${transfusion.patient.firstName[0]}${transfusion.patient.lastName[0]}`
                  const isCompleting = completingIds.has(transfusion._id)
                  return (
                    <TableRow key={transfusion._id} className="hover:bg-gray-50 bg-gray-50/50">
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{transfusion.patient.Hdist}</span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{transfusion.patient.Hrecu}</span>
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
                      {(() => {
                        // Fallback logic for second table
                        const hasF2 = transfusion.hasF !== undefined ? transfusion.hasF : transfusion.patient.hasF
                        const hasC2 = transfusion.hasC !== undefined ? transfusion.hasC : transfusion.patient.hasC
                        const hasL2 = transfusion.hasL !== undefined ? transfusion.hasL : transfusion.patient.hasL
                        const poches2 = transfusion.poches || transfusion.patient.poches
                        const hb2 = transfusion.hb || transfusion.patient.hb
                        const description2 = transfusion.description || transfusion.patient.don
                        
                        return (
                          <>
                            <TableCell className="text-center">
                              {hasF2 ? (
                                <div className="w-4 h-4 bg-purple-500 rounded-sm flex items-center justify-center mx-auto">
                                  <span className="text-white text-xs">✓</span>
                                </div>
                              ) : (
                                <div className="w-4 h-4 border border-gray-300 rounded-full mx-auto"></div>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {hasC2 ? (
                                <div className="w-4 h-4 bg-purple-500 rounded-sm flex items-center justify-center mx-auto">
                                  <span className="text-white text-xs">✓</span>
                                </div>
                              ) : (
                                <div className="w-4 h-4 border border-gray-300 rounded-full mx-auto"></div>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {hasL2 ? (
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
                                {transfusion.priority === "urgent" ? "Urgent" : "Normal"}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-semibold">{poches2}</TableCell>
                            <TableCell className="font-semibold">{hb2}</TableCell>
                            <TableCell>{description2}</TableCell>
                          </>
                        )
                      })()}

                      <TableCell className="hidden print:table-cell">
                        <Badge className="bg-green-100 text-green-800">Présent</Badge>
                      </TableCell>
                      <TableCell className="print:hidden flex items-center space-x-2">
                        <div className="flex items-center space-x-2">
                          {transfusion.status === "completed" && (
                            <Button
                              size="sm"
                              className="bg-red-600 hover:bg-red-700"
                              onClick={() => handleUnmarkAsCompleted(transfusion._id)}
                              disabled={isCompleting}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {isCompleting ? "Chargement..." : "Annuler"}
                            </Button>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          {transfusion.status !== "completed" && (
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleMarkAsCompleted(transfusion._id)}
                              disabled={isCompleting}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {isCompleting ? "Chargement..." : "Marquer terminé"}
                            </Button>
                          )}
                        </div>
                        <div></div>
                        <Link href={`/transfusions/today/${transfusion.patient._id}/edit`}>
                          <Button variant="ghost" size="sm" className="h-8 w-20 p-0 hover:bg-blue-50">
                            <Edit className="h-4 w-4 text-blue-600" /> Modifier
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(transfusion._id)}
                          className="h-8 w-20"
                          disabled={deletingId === transfusion._id}
                        >
                          {deletingId === transfusion._id ? "..." : "Supprimer"}
                        </Button>
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
          Affichage de {filteredTransfusions.length} transfusions{" "}
          {searchQuery.trim() ? `correspondant à "${searchQuery}"` : "programmées pour aujourd'hui"}
          {completedTransfusions.length > 0 &&
            ` (${completedTransfusions.length} terminées, ${pendingTransfusions.length} en attente)`}
        </p>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-100 rounded-full"></div>
            <span>Urgent</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-100 rounded-full"></div>
            <span>Normal</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-100 rounded-full"></div>
            <span>Terminé</span>
          </div>
        </div>
      </div>
      <div className="hidden print:block print-summary">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <strong>Résumé :</strong> {filteredTransfusions.length} transfusions au total
            {completedTransfusions.length > 0 &&
              ` (${completedTransfusions.length} terminées, ${pendingTransfusions.length} en attente)`}
          </div>
          <div style={{ display: "flex", gap: "15pt" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "3pt" }}>
              <div style={{ width: "8pt", height: "8pt", backgroundColor: "#fecaca", borderRadius: "50%" }}></div>
              <span>Urgent</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "3pt" }}>
              <div style={{ width: "8pt", height: "8pt", backgroundColor: "#dbeafe", borderRadius: "50%" }}></div>
              <span>Normal</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "3pt" }}>
              <div style={{ width: "8pt", height: "8pt", backgroundColor: "#dcfce7", borderRadius: "50%" }}></div>
              <span>Terminé</span>
            </div>
          </div>
        </div>
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
          table th:nth-child(1), table td:nth-child(1) { width: 6% !important; } /* H.dist */
          table th:nth-child(2), table td:nth-child(2) { width: 6% !important; } /* H.reçu */
          table th:nth-child(3), table td:nth-child(3) { width: 18% !important; } /* Patient */
          table th:nth-child(4), table td:nth-child(4) { width: 8% !important; } /* Groupe sanguin */
          table th:nth-child(5), table td:nth-child(5) { width: 10% !important; } /* Phénotype */
          table th:nth-child(6), table td:nth-child(6) { width: 3% !important; } /* F */
          table th:nth-child(7), table td:nth-child(7) { width: 3% !important; } /* C */
          table th:nth-child(8), table td:nth-child(8) { width: 4% !important; } /* L */
          table th:nth-child(9), table td:nth-child(9) { width: 8% !important; } /* Priorité */
          table th:nth-child(10), table td:nth-child(10) { width: 6% !important; } /* Poches */
          table th:nth-child(11), table td:nth-child(11) { width: 6% !important; } /* Hb */
          table th:nth-child(12), table td:nth-child(12) { width: 8% !important; } /* Statut */
          table th:nth-child(13), table td:nth-child(13) { width: 8% !important; } /* Actions/Présence */
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

          /* Centrer des colonnes spécifiques */
          td:nth-child(6), td:nth-child(7), td:nth-child(8), 
          td:nth-child(10), td:nth-child(11) {
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

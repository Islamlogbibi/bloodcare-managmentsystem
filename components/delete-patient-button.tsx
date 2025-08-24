"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { deletePatient } from "@/app/lib/actions"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface DeletePatientButtonProps {
  patientId: string
  onDelete?: () => void
}

export function DeletePatientButton({ patientId, onDelete }: DeletePatientButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      console.log("Tentative de suppression du patient avec ID:", patientId)

      const result = await deletePatient(patientId)

      if (result.success) {
        toast({
          title: "Patient supprimé",
          description: "Le patient a été supprimé avec succès.",
        })

        if (onDelete) {
          onDelete()
        }

        router.refresh()
        setOpen(false)
      } else {
        throw new Error("Échec de la suppression")
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du patient:", error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le patient. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50">
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Supprimer le patient</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irréversible. Elle supprimera définitivement le dossier du patient et toutes les données associées.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
            {isDeleting ? "Suppression..." : "Supprimer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

"use client"

import type React from "react"

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
} from "@/components/ui/alert-dialog"
import { deletePatient } from "@/app/lib/actions"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface DeletePatientButtonProps {
  id: string
  children?: React.ReactNode
}

export function DeletePatientButton({ id, children }: DeletePatientButtonProps) {
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await deletePatient(id)
      toast({
        title: "Patient deleted",
        description: "The patient has been successfully deleted.",
      })
      router.refresh()
    } catch (error) {
      console.error("Error deleting patient:", error)
      toast({
        title: "Error",
        description: "Failed to delete patient. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setOpen(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      {children ? (
        <div onClick={() => setOpen(true)}>{children}</div>
      ) : (
        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={() => setOpen(true)}>
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete</span>
        </Button>
      )}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to delete this patient?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the patient record and all associated data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleDelete()
            }}
            className="bg-red-600 hover:bg-red-700"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

"use client"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Calendar } from "lucide-react"
import Link from "next/link"
import { format, differenceInDays, addDays } from "date-fns"
import { fr } from "date-fns/locale"
import { DeletePatientButton } from "@/components/delete-patient-button"
import { QuickScheduleDialog } from "@/components/quick-schedule-dialog"
import { useLanguage } from "@/contexts/language-context"

interface PatientListClientProps {
  patients: any[]
}

export function PatientListClient({ patients }: PatientListClientProps) {
  const { t } = useLanguage()

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="font-semibold text-gray-900">{t("nomEtPrenom")}</TableHead>
              <TableHead className="font-semibold text-gray-900 text-center">{t("gp")}</TableHead>
              <TableHead className="font-semibold text-gray-900 text-center">{t("ph")}</TableHead>
              <TableHead className="font-semibold text-gray-900 text-center">{t("f")}</TableHead>
              <TableHead className="font-semibold text-gray-900 text-center">{t("c")}</TableHead>
              <TableHead className="font-semibold text-gray-900 text-center">{t("l")}</TableHead>
              <TableHead className="font-semibold text-gray-900">{t("derniereT")}</TableHead>
              <TableHead className="font-semibold text-gray-900">{t("prochaineT")}</TableHead>
              <TableHead className="font-semibold text-gray-900">{t("jecoulés")}</TableHead>
              <TableHead className="font-semibold text-gray-900">{t("renseignements")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.map((patient) => {
              // Calculate next transfusion date (90 days after last donation)
              const lastDonationDate = patient.lastDonationDate ? new Date(patient.lastDonationDate) : null
              const nextTransfusionDate = lastDonationDate ? addDays(lastDonationDate, 90) : null

              // Calculate days elapsed
              const daysElapsed = lastDonationDate ? differenceInDays(new Date(), lastDonationDate) : null

              // Extract blood group and type
              const bloodGroup = patient.bloodType ? patient.bloodType.charAt(0) : ""
              const bloodPhFactor = patient.bloodType ? (patient.bloodType.includes("+") ? "+" : "-") : ""

              return (
                <TableRow key={patient._id} className="hover:bg-gray-50">
                  <TableCell className="font-medium text-gray-900">
                    {patient.firstName} {patient.lastName}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-gray-700 font-medium">{bloodGroup}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-gray-700 font-medium">{bloodPhFactor}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    {patient.hasF ? (
                      <div className="w-4 h-4 bg-purple-500 rounded-sm flex items-center justify-center mx-auto">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    ) : (
                      <div className="w-4 h-4 border border-gray-300 rounded-sm mx-auto"></div>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {patient.hasC ? (
                      <div className="w-4 h-4 bg-purple-500 rounded-sm flex items-center justify-center mx-auto">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    ) : (
                      <div className="w-4 h-4 border border-gray-300 rounded-sm mx-auto"></div>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {patient.hasL ? (
                      <div className="w-4 h-4 bg-purple-500 rounded-sm flex items-center justify-center mx-auto">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    ) : (
                      <div className="w-4 h-4 border border-gray-300 rounded-sm mx-auto"></div>
                    )}
                  </TableCell>
                  <TableCell>
                    {lastDonationDate ? format(lastDonationDate, "dd MMM yyyy", { locale: fr }) : "N/D"}
                  </TableCell>
                  <TableCell>
                    {nextTransfusionDate ? format(nextTransfusionDate, "dd MMM yyyy", { locale: fr }) : "N/D"}
                  </TableCell>
                  <TableCell>{daysElapsed !== null ? `-${daysElapsed}j` : "N/D"}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <QuickScheduleDialog patient={patient}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <Calendar className="h-4 w-4" />
                        </Button>
                      </QuickScheduleDialog>
                      <Link href={`/patients/${patient._id}/view`}>
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                          {t("view")}
                        </Button>
                      </Link>
                      <Link href={`/patients/${patient._id}/edit`}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-50">
                          <Edit className="h-4 w-4 text-blue-600" />
                        </Button>
                      </Link>
                      <DeletePatientButton patientId={patient._id} />
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600">
        <p>Affichage de {patients.length} patients</p>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" disabled>
            Précédent
          </Button>
          <Button variant="outline" size="sm">
            Suivant
          </Button>
        </div>
      </div>
    </div>
  )
}

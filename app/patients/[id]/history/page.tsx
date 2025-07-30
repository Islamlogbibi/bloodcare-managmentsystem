import { format } from "date-fns"
import { getPatientById } from "@/app/lib/actions"
import { Printer } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import PrintStyles from "./style"
import PrintButton from "./Button"

export default async function HistoryPage({ params }: { params: { id: string } }) {
  const res = await fetch(`http://localhost:3000/api/patient-history?id=${params.id}`, {
    cache: "no-store",
  });
  const history = await res.json();

  const patient = await getPatientById(params.id);
  if (!patient) return <div>Patient not found</div>;


  return (
    <div className="space-y-4 p-4">
        <div className="flex justify-end mb-4 print:hidden">
            <PrintButton />
        </div>
      <h1 className="text-2xl font-bold">Schedule History</h1>

      {history.length === 0 ? (
        <p>No past schedules.</p>
      ) : (
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Blood Type</TableHead>
                <TableHead>Phénotype</TableHead>
                <TableHead>F</TableHead>
                <TableHead>C</TableHead>
                <TableHead>L</TableHead>
                <TableHead>Hb</TableHead>
                <TableHead>Poches</TableHead>
                <TableHead>H.dist</TableHead>
                <TableHead>H.recu</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((schedule: any, index: number) => (
                
                <TableRow key={index}>
                  <TableCell>{format(new Date(schedule.scheduledTime), 'yyyy-MM-dd HH:mm')}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        schedule.priority === "urgent"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      }
                    >
                      {schedule.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>{schedule.patient.bloodType}</TableCell>
                  <TableCell>{schedule.patient.ph}</TableCell>
                  <TableCell className="text-center">
                    {schedule.patient.hasF ? "✓" : ""}
                  </TableCell>
                  <TableCell className="text-center">
                    {schedule.patient.hasC ? "✓" : ""}
                  </TableCell>
                  <TableCell className="text-center">
                    {schedule.patient.hasL ? "✓" : ""}
                  </TableCell>
                  <TableCell>{schedule.patient.hb}</TableCell>
                  <TableCell>{schedule.patient.poches}</TableCell>
                  <TableCell>{schedule.patient.Hdist}</TableCell>
                  <TableCell>{schedule.patient.Hrecu}</TableCell>
                  <TableCell>{schedule.patient.description || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      {/* Print-specific styles */}
      <PrintStyles />
    </div>
  )
}

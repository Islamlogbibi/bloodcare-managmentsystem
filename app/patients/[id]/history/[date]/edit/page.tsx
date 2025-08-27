import { notFound } from "next/navigation";
import { Hbfform } from "@/components/edit-hbf";
import { getPatientById } from "@/app/lib/actions";

interface EditPageProps {
  params: { id: string; date: string };
}

export default async function HistoryPageEdit({ params }: EditPageProps) {
  const { id, date } = params;
  const decodedDate = decodeURIComponent(date);

  // Fetch the patient
  const patient = await getPatientById(id);
  if (!patient) notFound();

  // Find the specific schedule for this date
  const schedule = patient.schedules?.find(
    (s: any) => new Date(s.date).toISOString().split("T")[0] === decodedDate
  );

  if (!schedule) notFound();

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">
        Modifier HbF du {decodedDate}
      </h2>

      <Hbfform
        patientId={id}
        date={decodedDate}
        history={schedule}
        isEditing
      />
    </div>
  );
}

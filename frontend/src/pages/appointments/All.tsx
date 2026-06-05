import { useState } from "react";
import { Link } from "wouter";
import { AppLayout } from "@/components/AppLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { LoadingState } from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";
import { useListAppointments, useUpdateAppointment, useCancelAppointment } from "@/api/hooks";
import { ClipboardList, Calendar, Clock, MapPin, Stethoscope } from "lucide-react";

const STATUSES = ["all", "pending", "confirmed", "completed", "cancelled"] as const;

export default function AllAppointments() {
  const [filter, setFilter] = useState("all");

  const { data: appointments, isLoading, refetch } = useListAppointments();
  const updateMutation = useUpdateAppointment();
  const cancelMutation = useCancelAppointment();

  const filtered = filter === "all"
    ? appointments
    : appointments?.filter((a) => a.status === filter);

  function handleStatus(id: number, status: string) {
    updateMutation.mutate({ id, data: { status } }, { onSuccess: () => refetch() });
  }

  function handleCancel(id: number) {
    if (!confirm("Cancel this appointment?")) return;
    cancelMutation.mutate(id, { onSuccess: () => refetch() });
  }

  return (
    <AppLayout>
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-5">
          <ClipboardList className="w-6 h-6 text-[#0f7bb5]" />
          All Appointments
        </h1>

        {/* status filter tabs */}
        <div className="flex flex-wrap gap-2 mb-5">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                filter === s
                  ? "bg-[#0f7bb5] text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {s}
              {appointments && (
                <span className="ml-1.5 text-xs opacity-70">
                  ({s === "all" ? appointments.length : appointments.filter((a) => a.status === s).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {isLoading ? (
          <LoadingState />
        ) : !filtered || filtered.length === 0 ? (
          <EmptyState
            title="No appointments"
            description={filter !== "all" ? `No ${filter} appointments.` : undefined}
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((appt) => {
              const formattedDate = new Date(appt.date + "T00:00:00").toLocaleDateString("en-SA", {
                weekday: "short", month: "short", day: "numeric",
              });

              return (
                <div key={appt.id} className="card p-4 flex items-start justify-between gap-3">

                  {/* clicking the left side goes to the detail page */}
                  <Link href={`/appointments/${appt.id}`} className="flex-1 min-w-0 space-y-2 hover:opacity-80">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{appt.patientName}</p>
                        {appt.doctorName && (
                          <p className="text-xs text-[#0f7bb5] flex items-center gap-1 mt-0.5">
                            <Stethoscope className="w-3 h-3" />{appt.doctorName} — {appt.specialty}
                          </p>
                        )}
                      </div>
                      <StatusBadge status={appt.status} />
                    </div>

                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formattedDate}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{appt.time}</span>
                      {appt.clinic && (
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{appt.clinic}, {appt.city}</span>
                      )}
                    </div>

                    {appt.reason && <p className="text-xs text-gray-400 line-clamp-1">{appt.reason}</p>}
                  </Link>

                  {/* quick action buttons on the right */}
                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    {appt.status === "pending" && (
                      <button onClick={() => handleStatus(appt.id, "confirmed")} disabled={updateMutation.isPending}
                        className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">
                        Confirm
                      </button>
                    )}
                    {appt.status === "confirmed" && (
                      <button onClick={() => handleStatus(appt.id, "completed")} disabled={updateMutation.isPending}
                        className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors">
                        Complete
                      </button>
                    )}
                    {appt.status !== "cancelled" && appt.status !== "completed" && (
                      <button onClick={() => handleCancel(appt.id)} disabled={cancelMutation.isPending}
                        className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors">
                        Cancel
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

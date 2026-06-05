import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { AppointmentCard } from "@/components/AppointmentCard";
import { LoadingState } from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";
import { useListAppointments, useListDoctors, useUpdateAppointment, useCancelAppointment } from "@/api/hooks";
import { useAuth } from "@/hooks/use-auth";
import { ListChecks } from "lucide-react";

const STATUSES = ["all", "pending", "confirmed", "completed", "cancelled"] as const;

export default function MyAppointments() {
  const { user } = useAuth();
  const [filter, setFilter] = useState("all");

  const { data: doctors } = useListDoctors();
  const updateMutation = useUpdateAppointment();
  const cancelMutation = useCancelAppointment();

  // doctors look up appointments by their doctor profile id
  // patients look up by their user id
  const doctorProfile = doctors?.find((d) => d.userId === user?.id);
  const queryParams =
    user?.role === "doctor" && doctorProfile ? { doctorId: doctorProfile.id } :
    user?.role === "patient" && user          ? { patientId: user.id } :
    undefined;

  const { data: appointments, isLoading, refetch } = useListAppointments(queryParams);

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

  // doctors list is loaded but this user has no doctor profile — shouldn't normally happen
  if (user?.role === "doctor" && doctors !== undefined && !doctorProfile) {
    return (
      <AppLayout>
        <div className="p-6 max-w-4xl mx-auto">
          <EmptyState title="No appointments assigned" description="Your appointments will appear here once assigned." />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-5">
          <ListChecks className="w-6 h-6 text-[#0f7bb5]" />
          My Appointments
        </h1>

        {/* status filter tabs */}
        <div className="flex flex-wrap gap-2 mb-5">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
                filter === s
                  ? "bg-[#0f7bb5] text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {s}
              {appointments && (
                <span className="ml-1 text-xs opacity-70">
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
            description={filter !== "all" ? `No ${filter} appointments.` : "Nothing here yet."}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((appt) => (
              <div key={appt.id} className="space-y-2">
                <AppointmentCard
                  appointment={appt}
                  showDoctor={user?.role === "patient"}
                  showPatient={user?.role === "doctor"}
                />

                {/* doctors get quick action buttons under each card */}
                {user?.role === "doctor" && (
                  <div className="flex gap-2 px-1">
                    {appt.status === "pending" && (
                      <button onClick={() => handleStatus(appt.id, "confirmed")} disabled={updateMutation.isPending}
                        className="text-xs btn-primary py-1 px-3">
                        Confirm
                      </button>
                    )}
                    {appt.status === "confirmed" && (
                      <button onClick={() => handleStatus(appt.id, "completed")} disabled={updateMutation.isPending}
                        className="text-xs btn-primary py-1 px-3">
                        Mark Completed
                      </button>
                    )}
                    {appt.status !== "cancelled" && appt.status !== "completed" && (
                      <button onClick={() => handleCancel(appt.id)} disabled={cancelMutation.isPending}
                        className="text-xs btn-danger py-1 px-3">
                        Cancel
                      </button>
                    )}
                  </div>
                )}

                {/* patients can only cancel */}
                {user?.role === "patient" && appt.status !== "cancelled" && appt.status !== "completed" && (
                  <div className="px-1">
                    <button onClick={() => handleCancel(appt.id)} disabled={cancelMutation.isPending}
                      className="text-xs btn-danger py-1 px-3">
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

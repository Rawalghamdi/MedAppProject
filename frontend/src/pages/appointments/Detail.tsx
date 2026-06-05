import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { AppLayout } from "@/components/AppLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { LoadingState } from "@/components/LoadingState";
import { useGetAppointment, useUpdateAppointment, useCancelAppointment } from "@/api/hooks";
import { useAuth } from "@/hooks/use-auth";
import { Calendar, Clock, MapPin, Stethoscope, User, FileText, ArrowLeft, Pencil, X, Check } from "lucide-react";

const STATUS_OPTIONS = ["pending", "confirmed", "completed", "cancelled"];

export default function AppointmentDetail() {
  const [, params]  = useRoute("/appointments/:id");
  const id          = parseInt(params?.id ?? "0");
  const { user }    = useAuth();
  const [, setLocation] = useLocation();

  const { data: appt, isLoading, refetch } = useGetAppointment(id);
  const updateMutation = useUpdateAppointment();
  const cancelMutation = useCancelAppointment();

  // edit modal state
  const [editOpen,  setEditOpen]  = useState(false);
  const [editError, setEditError] = useState("");
  const [editForm,  setEditForm]  = useState({ date: "", time: "", reason: "", status: "" });

  const isPatient = user?.role === "patient";
  const canEdit   = user?.role === "admin" || user?.role === "doctor";

  function openEdit() {
    if (!appt) return;
    setEditForm({ date: appt.date, time: appt.time, reason: appt.reason, status: appt.status });
    setEditError("");
    setEditOpen(true);
  }

  function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    setEditError("");

    if (!editForm.date || !editForm.time || !editForm.reason || !editForm.status) {
      setEditError("All fields are required.");
      return;
    }

    updateMutation.mutate(
      { id, data: editForm },
      {
        onSuccess: () => { setEditOpen(false); refetch(); },
        onError: (err) => setEditError(err.message),
      }
    );
  }

  function handleQuickStatus(status: string) {
    updateMutation.mutate({ id, data: { status } }, { onSuccess: () => refetch() });
  }

  function handleCancel() {
    if (!confirm("Cancel this appointment?")) return;
    cancelMutation.mutate(id, {
      onSuccess: () => {
        refetch();
        if (isPatient) setLocation("/dashboard");
      },
    });
  }

  if (isLoading) return <AppLayout><LoadingState /></AppLayout>;
  if (!appt)     return <AppLayout><div className="p-6 text-gray-500">Appointment not found.</div></AppLayout>;

  return (
    <AppLayout>
      <div className="p-6 max-w-xl mx-auto space-y-5">

        {/* header row */}
        <div className="flex items-center gap-3">
          <button onClick={() => history.back()} className="btn-ghost p-1.5">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 flex-1">Appointment Details</h1>
          <StatusBadge status={appt.status} />
          {canEdit && (
            <button onClick={openEdit} className="btn-ghost p-1.5 text-gray-400 hover:text-[#0f7bb5]" title="Edit">
              <Pencil className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* main details */}
        <div className="card p-6 space-y-4">
          <InfoRow icon={<Calendar />} label="Date"
            value={new Date(appt.date + "T00:00:00").toLocaleDateString("en-SA", {
              weekday: "long", year: "numeric", month: "long", day: "numeric",
            })}
          />
          <InfoRow icon={<Clock />}      label="Time"    value={appt.time} />
          {appt.doctorName  && <InfoRow icon={<Stethoscope />} label="Doctor"  value={appt.doctorName} />}
          {appt.patientName && <InfoRow icon={<User />}        label="Patient" value={appt.patientName} />}
          {appt.clinic      && <InfoRow icon={<MapPin />}      label="Clinic"  value={`${appt.clinic}, ${appt.city}`} />}

          <div className="flex items-start gap-3 pt-2 border-t">
            <FileText className="w-4 h-4 text-[#0f7bb5] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-400 mb-1">Reason</p>
              <p className="text-sm text-gray-700 leading-relaxed">{appt.reason}</p>
            </div>
          </div>
        </div>

        {/* action buttons for doctor / admin */}
        {canEdit && (
          <div className="flex flex-wrap gap-2">
            {appt.status === "pending" && (
              <button className="btn-primary" onClick={() => handleQuickStatus("confirmed")} disabled={updateMutation.isPending}>
                <Check className="w-4 h-4" /> Confirm
              </button>
            )}
            {appt.status === "confirmed" && (
              <button className="btn-primary" onClick={() => handleQuickStatus("completed")} disabled={updateMutation.isPending}>
                <Check className="w-4 h-4" /> Mark Completed
              </button>
            )}
            {appt.status !== "cancelled" && appt.status !== "completed" && (
              <button className="btn-danger" onClick={handleCancel} disabled={cancelMutation.isPending}>
                Cancel
              </button>
            )}
          </div>
        )}

        {/* patients can only cancel */}
        {isPatient && appt.status !== "cancelled" && appt.status !== "completed" && (
          <button className="btn-danger" onClick={handleCancel} disabled={cancelMutation.isPending}>
            Cancel Appointment
          </button>
        )}
      </div>

      {/* edit modal — only shown for admin/doctor */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">

            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-semibold text-gray-900">Edit Appointment</h2>
              <button onClick={() => setEditOpen(false)} className="p-1 rounded hover:bg-gray-100">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="px-6 py-5 space-y-4">
              {editError && <p className="text-sm text-red-500">{editError}</p>}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label" htmlFor="edit-date">Date</label>
                  <input id="edit-date" type="date" className="form-input" value={editForm.date}
                    onChange={(e) => setEditForm(f => ({ ...f, date: e.target.value }))} />
                </div>
                <div>
                  <label className="form-label" htmlFor="edit-time">Time</label>
                  <input id="edit-time" type="time" className="form-input" value={editForm.time}
                    onChange={(e) => setEditForm(f => ({ ...f, time: e.target.value }))} />
                </div>
              </div>

              <div>
                <label className="form-label" htmlFor="edit-status">Status</label>
                <select id="edit-status" className="form-input" value={editForm.status}
                  onChange={(e) => setEditForm(f => ({ ...f, status: e.target.value }))}>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label" htmlFor="edit-reason">Reason</label>
                <textarea id="edit-reason" className="form-input min-h-[80px]" rows={3} value={editForm.reason}
                  onChange={(e) => setEditForm(f => ({ ...f, reason: e.target.value }))} />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button type="button" className="btn-secondary" onClick={() => setEditOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

// small helper component to show one row of info (icon + label + value)
function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-[#0f7bb5] w-4 h-4 mt-0.5 flex-shrink-0">{icon}</span>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm text-gray-800 font-medium">{value}</p>
      </div>
    </div>
  );
}

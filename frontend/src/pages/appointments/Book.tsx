import { useState } from "react";
import { useLocation } from "wouter";
import { AppLayout } from "@/components/AppLayout";
import { LoadingState } from "@/components/LoadingState";
import { useListDoctors, useCreateAppointment } from "@/api/hooks";
import { useAuth } from "@/hooks/use-auth";
import { Stethoscope, MapPin } from "lucide-react";

export default function BookAppointment() {
  const { user } = useAuth();
  const { data: doctors, isLoading } = useListDoctors();
  const createMutation = useCreateAppointment();
  const [, setLocation] = useLocation();

  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
  const [form, setForm] = useState({ date: "", time: "", reason: "" });
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor || !user) return;
    if (!form.date || !form.time || !form.reason) {
      setError("All fields are required.");
      return;
    }
    setError("");
    createMutation.mutate(
      { doctorId: selectedDoctor, patientId: user.id, ...form },
      {
        onSuccess: () => setLocation("/dashboard"),
        onError: (err) => setError(err.message),
      }
    );
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Book an Appointment</h1>

        {isLoading ? <LoadingState /> : (
          <>
            <div>
              <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
                Step 1 — Select a Doctor
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {doctors?.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDoctor(doc.id)}
                    className={`card p-4 text-left flex items-center gap-3 transition-all ${
                      selectedDoctor === doc.id
                        ? "ring-2 ring-[#0f7bb5] bg-[#0f7bb5]/5"
                        : "hover:border-[#0f7bb5]/40"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-teal-700 font-bold">{doc.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{doc.name}</p>
                      <p className="text-xs text-[#0f7bb5] flex items-center gap-1">
                        <Stethoscope className="w-3 h-3" />{doc.specialty}
                      </p>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />{doc.clinic}, {doc.city}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {selectedDoctor && (
              <div>
                <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
                  Step 2 — Appointment Details
                </h2>
                <form onSubmit={handleSubmit} className="card p-5 space-y-4">
                  {error && <div className="text-red-500 text-sm">{error}</div>}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="form-label" htmlFor="date">Date</label>
                      <input
                        id="date"
                        type="date"
                        className="form-input"
                        value={form.date}
                        onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))}
                        min={new Date().toISOString().split("T")[0]}
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label" htmlFor="time">Time</label>
                      <input
                        id="time"
                        type="time"
                        className="form-input"
                        value={form.time}
                        onChange={(e) => setForm(f => ({ ...f, time: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="form-label" htmlFor="reason">Reason for Visit</label>
                    <textarea
                      id="reason"
                      className="form-input min-h-[80px]"
                      rows={3}
                      value={form.reason}
                      onChange={(e) => setForm(f => ({ ...f, reason: e.target.value }))}
                      placeholder="Describe your symptoms or reason for the visit..."
                      required
                    />
                  </div>
                  <button type="submit" className="btn-primary w-full py-2.5" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Booking..." : "Book Appointment"}
                  </button>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}

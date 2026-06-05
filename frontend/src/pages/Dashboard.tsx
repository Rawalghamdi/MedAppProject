import { AppLayout } from "@/components/AppLayout";
import { StatsCard } from "@/components/StatsCard";
import { AppointmentCard } from "@/components/AppointmentCard";
import { LoadingState } from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";
import { useAuth } from "@/hooks/use-auth";
import { useDashboardStats, useRecentAppointments, useListAppointments, useListDoctors } from "@/api/hooks";
import { LayoutDashboard, Users, CalendarCheck, Clock } from "lucide-react";

// show a different dashboard depending on the user's role
export default function Dashboard() {
  const { user } = useAuth();

  if (user?.role === "admin")  return <AdminDashboard />;
  if (user?.role === "doctor") return <DoctorDashboard />;
  return <PatientDashboard />;
}

function AdminDashboard() {
  const { data: stats,  isLoading: statsLoading  } = useDashboardStats();
  const { data: recent, isLoading: recentLoading } = useRecentAppointments();

  return (
    <AppLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-[#0f7bb5]" />
            Admin Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">System overview</p>
        </div>

        {statsLoading ? <LoadingState /> : stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatsCard title="Total Appointments" value={stats.totalAppointments}  icon={<CalendarCheck className="w-5 h-5" />} />
            <StatsCard title="Pending"            value={stats.pendingAppointments} icon={<Clock className="w-5 h-5" />} color="text-yellow-500" />
            <StatsCard title="Total Doctors"      value={stats.totalDoctors}        icon={<Users className="w-5 h-5" />} />
            <StatsCard title="Total Patients"     value={stats.totalPatients}       icon={<Users className="w-5 h-5" />} color="text-teal-500" />
          </div>
        )}

        <div>
          <h2 className="text-base font-semibold text-gray-700 mb-3">Recent Appointments</h2>
          {recentLoading ? <LoadingState /> : !recent || recent.length === 0 ? (
            <EmptyState title="No appointments yet" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recent.map((a) => (
                <AppointmentCard key={a.id} appointment={a} showDoctor showPatient />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

function DoctorDashboard() {
  const { user } = useAuth();
  const { data: doctors } = useListDoctors();

  const doctorProfile = doctors?.find((d) => d.userId === user?.id);

  const { data: appointments, isLoading } = useListAppointments(
    doctorProfile ? { doctorId: doctorProfile.id } : undefined
  );

  const pending   = appointments?.filter((a) => a.status === "pending").length   ?? 0;
  const confirmed = appointments?.filter((a) => a.status === "confirmed").length ?? 0;

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
          {doctorProfile && (
            <p className="text-sm text-gray-500 mt-0.5">
              {doctorProfile.name} — {doctorProfile.specialty}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatsCard title="Total" value={appointments?.length ?? 0} icon={<CalendarCheck className="w-5 h-5" />} />
          <StatsCard title="Pending"   value={pending}   icon={<Clock className="w-5 h-5" />} color="text-yellow-500" />
          <StatsCard title="Confirmed" value={confirmed} icon={<CalendarCheck className="w-5 h-5" />} color="text-green-500" />
        </div>

        <div>
          <h2 className="text-base font-semibold text-gray-700 mb-3">Upcoming Appointments</h2>
          {isLoading ? <LoadingState /> : !appointments || appointments.length === 0 ? (
            <EmptyState title="No appointments assigned" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {appointments.slice(0, 6).map((a) => (
                <AppointmentCard key={a.id} appointment={a} showPatient />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

function PatientDashboard() {
  const { user } = useAuth();

  const { data: appointments, isLoading } = useListAppointments(
    user ? { patientId: user.id } : undefined
  );

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
          <p className="text-sm text-gray-500 mt-0.5">Welcome back, {user?.name}</p>
        </div>

        {isLoading ? <LoadingState /> : !appointments || appointments.length === 0 ? (
          <EmptyState title="No appointments yet" description="Book your first appointment from the sidebar." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {appointments.map((a) => (
              <AppointmentCard key={a.id} appointment={a} showDoctor />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

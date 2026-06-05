import { Link } from "wouter";
import { Calendar, Clock, MapPin, Stethoscope } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import type { Appointment } from "@/types/api";

interface AppointmentCardProps {
  appointment: Appointment;
  showDoctor?: boolean;
  showPatient?: boolean;
}

export function AppointmentCard({
  appointment: a,
  showDoctor = false,
  showPatient = false,
}: AppointmentCardProps) {
  const formattedDate = new Date(a.date + "T00:00:00").toLocaleDateString("en-SA", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <Link
      href={`/appointments/${a.id}`}
      className="card p-4 space-y-3 block hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5">
          {showDoctor && a.doctorName && (
            <p className="text-sm font-semibold text-gray-900">{a.doctorName}</p>
          )}
          {showPatient && a.patientName && (
            <p className="text-sm font-semibold text-gray-900">{a.patientName}</p>
          )}
          {a.specialty && (
            <p className="text-xs text-[#0f7bb5] flex items-center gap-1">
              <Stethoscope className="w-3 h-3" />
              {a.specialty}
            </p>
          )}
        </div>
        <StatusBadge status={a.status} />
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {formattedDate}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {a.time}
        </span>
        {a.clinic && (
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {a.clinic}, {a.city}
          </span>
        )}
      </div>

      {a.reason && (
        <p className="text-xs text-gray-500 bg-gray-50 rounded-md px-3 py-2 leading-relaxed line-clamp-2">
          {a.reason}
        </p>
      )}
    </Link>
  );
}

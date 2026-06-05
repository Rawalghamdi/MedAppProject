import { useState, useMemo } from "react";
import { AppLayout } from "@/components/AppLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { LoadingState } from "@/components/LoadingState";
import { useListAppointments, useListDoctors } from "@/api/hooks";
import { useAuth } from "@/hooks/use-auth";
import type { Appointment } from "@/types/api";
import { ChevronLeft, ChevronRight, CalendarRange } from "lucide-react";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS   = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function buildCells(year: number, month: number) {
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev  = new Date(year, month, 0).getDate();
  const cells: { day: number; current: boolean }[] = [];
  for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: daysInPrev - i, current: false });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, current: true });
  while (cells.length < 42) cells.push({ day: cells.length - daysInMonth - firstDay + 2, current: false });
  return cells;
}

function toStr(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export default function CalendarPage() {
  const { user }  = useAuth();
  const today     = new Date();
  const [year,  setYear]   = useState(today.getFullYear());
  const [month, setMonth]  = useState(today.getMonth());
  const [selected, setSelected] = useState(toStr(today.getFullYear(), today.getMonth(), today.getDate()));

  const { data: doctors }     = useListDoctors();
  const doctorProfile         = doctors?.find((d) => d.userId === user?.id);

  const queryParams =
    user?.role === "doctor" && doctorProfile
      ? { doctorId: doctorProfile.id }
      : user?.role === "patient" && user
      ? { patientId: user.id }
      : undefined;

  const { data: appointments, isLoading } = useListAppointments(queryParams);

  const byDate = useMemo(() => {
    const map: Record<string, Appointment[]> = {};
    appointments?.forEach((a) => {
      if (!map[a.date]) map[a.date] = [];
      map[a.date].push(a);
    });
    return map;
  }, [appointments]);

  const cells         = useMemo(() => buildCells(year, month), [year, month]);
  const todayStr      = toStr(today.getFullYear(), today.getMonth(), today.getDate());
  const selectedAppts = byDate[selected] ?? [];

  const prev = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const next = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  if (isLoading) return <AppLayout><LoadingState /></AppLayout>;

  return (
    <AppLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <CalendarRange className="w-6 h-6 text-[#0f7bb5]" /> Calendar
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar grid */}
          <div className="lg:col-span-2 card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <button onClick={prev} className="p-1.5 rounded hover:bg-gray-100">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="font-semibold text-gray-900">{MONTHS[month]} {year}</span>
              <button onClick={next} className="p-1.5 rounded hover:bg-gray-100">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-7 border-b">
              {WEEKDAYS.map((d) => (
                <div key={d} className="py-2 text-center text-xs font-semibold text-gray-400 uppercase">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {cells.map((cell, i) => {
                const dateStr = cell.current ? toStr(year, month, cell.day) : null;
                const count   = dateStr ? (byDate[dateStr]?.length ?? 0) : 0;
                const isToday = dateStr === todayStr;
                const isSel   = dateStr === selected;
                return (
                  <button
                    key={i}
                    disabled={!cell.current}
                    onClick={() => dateStr && setSelected(dateStr)}
                    className={`min-h-[64px] p-1.5 border-b border-r text-sm flex flex-col items-start transition-colors ${
                      !cell.current ? "text-gray-300 bg-gray-50/50 cursor-default" : "cursor-pointer hover:bg-blue-50"
                    } ${isSel && cell.current ? "bg-[#0f7bb5]/10" : ""}`}
                  >
                    <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-semibold mb-1 ${
                      isToday ? "bg-[#0f7bb5] text-white" :
                      isSel   ? "text-[#0f7bb5] font-bold" :
                      "text-gray-700"
                    } ${!cell.current ? "text-gray-300" : ""}`}>
                      {cell.day}
                    </span>
                    {count > 0 && (
                      <span className="text-[10px] font-semibold bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded-full">
                        {count} appt{count > 1 ? "s" : ""}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Side panel */}
          <div className="card flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b">
              <p className="text-sm font-semibold text-gray-700">
                {selected
                  ? new Date(selected + "T00:00:00").toLocaleDateString("en-SA", {
                      weekday: "long", month: "long", day: "numeric",
                    })
                  : "Select a day"}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {selectedAppts.length === 0
                  ? "No appointments"
                  : `${selectedAppts.length} appointment${selectedAppts.length > 1 ? "s" : ""}`}
              </p>
            </div>
            <div className="flex-1 overflow-y-auto divide-y">
              {selectedAppts.length === 0 ? (
                <div className="p-6 text-center text-sm text-gray-400">
                  No appointments on this day.
                </div>
              ) : (
                selectedAppts.map((a) => (
                  <div key={a.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-gray-800">{a.time}</span>
                      <StatusBadge status={a.status} />
                    </div>
                    <p className="text-sm text-gray-700">{a.patientName ?? a.doctorName ?? "—"}</p>
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{a.reason}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

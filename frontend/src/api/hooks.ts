import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "./client";
import type { Doctor, Appointment, DashboardStats, AuthResponse } from "@/types/api";
// React Query hooks for every API endpoint.
// useQuery = fetching data, useMutation = creating/updating/deleting

// ── Auth ──────────────────────────────────────────────────────────────────────

export function useLogin() {
  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      apiFetch<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (data: { name: string; email: string; password: string; phone: string }) =>
      apiFetch<AuthResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  });
}

// ── Doctors ───────────────────────────────────────────────────────────────────

export function useListDoctors() {
  return useQuery<Doctor[]>({
    queryKey: ["doctors"],
    queryFn: () => apiFetch<Doctor[]>("/doctors"),
  });
}

export function useCreateDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      email: string;
      password: string;
      phone: string;
      specialty: string;
      clinic: string;
      city: string;
      bio?: string;
    }) => apiFetch<Doctor>("/doctors", { method: "POST", body: JSON.stringify(data) }),
    // refresh the doctor list after adding one
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["doctors"] }),
  });
}

export function useUpdateDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      id: number;
      data: Partial<{ name: string; phone: string; specialty: string; clinic: string; city: string; bio: string | null }>;
    }) =>
      apiFetch<Doctor>(`/doctors/${payload.id}`, {
        method: "PATCH",
        body: JSON.stringify(payload.data),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["doctors"] }),
  });
}

export function useDeleteDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch<null>(`/doctors/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["doctors"] }),
  });
}

// ── Appointments ──────────────────────────────────────────────────────────────

export function useListAppointments(params?: { patientId?: number; doctorId?: number }) {
  // build the query string e.g. ?patientId=3
  const qs = new URLSearchParams();
  if (params?.patientId) qs.set("patientId", String(params.patientId));
  if (params?.doctorId)  qs.set("doctorId",  String(params.doctorId));
  const queryString = qs.toString() ? `?${qs}` : "";

  return useQuery<Appointment[]>({
    queryKey: ["appointments", params],
    queryFn: () => apiFetch<Appointment[]>(`/appointments${queryString}`),
  });
}

export function useGetAppointment(id: number) {
  return useQuery<Appointment>({
    queryKey: ["appointments", id],
    queryFn: () => apiFetch<Appointment>(`/appointments/${id}`),
    enabled: !!id,
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      doctorId: number;
      patientId: number;
      date: string;
      time: string;
      reason: string;
    }) =>
      apiFetch<Appointment>("/appointments", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["appointments"] }),
  });
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      id: number;
      data: Partial<{ status: string; date: string; time: string; reason: string }>;
    }) =>
      apiFetch<Appointment>(`/appointments/${payload.id}`, {
        method: "PATCH",
        body: JSON.stringify(payload.data),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["appointments"] }),
  });
}

export function useCancelAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      apiFetch<null>(`/appointments/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["appointments"] }),
  });
}

// ── Dashboard (admin only) ────────────────────────────────────────────────────

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ["dashboard", "stats"],
    queryFn: () => apiFetch<DashboardStats>("/dashboard/stats"),
  });
}

export function useRecentAppointments() {
  return useQuery<Appointment[]>({
    queryKey: ["dashboard", "recent"],
    queryFn: () => apiFetch<Appointment[]>("/dashboard/recent-appointments"),
  });
}

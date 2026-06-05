export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "doctor" | "patient";
  phone: string;
  createdAt: string;
}

export interface Doctor {
  id: number;
  userId: number;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  clinic: string;
  city: string;
  bio: string | null;
  createdAt: string;
}

export interface Appointment {
  id: number;
  doctorId: number;
  patientId: number;
  doctorName: string | null;
  patientName: string | null;
  specialty: string | null;
  clinic: string | null;
  city: string | null;
  date: string;
  time: string;
  reason: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: string;
}

export interface DashboardStats {
  totalAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  totalDoctors: number;
  totalPatients: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

import { Switch, Route, Redirect } from "wouter";
import { useAuth } from "@/hooks/use-auth";

import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import DoctorsList from "@/pages/doctors/List";
import AdminDoctors from "@/pages/admin/Doctors";
import BookAppointment from "@/pages/appointments/Book";
import AppointmentDetail from "@/pages/appointments/Detail";
import AllAppointments from "@/pages/appointments/All";
import MyAppointments from "@/pages/appointments/My";
import CalendarPage from "@/pages/calendar/CalendarPage";
import Contact from "@/pages/Contact";

function ProtectedRoute({
  component: Component,
  adminOnly = false,
}: {
  component: React.ComponentType;
  adminOnly?: boolean;
}) {
  const { user } = useAuth();
  if (!user) return <Redirect to="/login" />;
  if (adminOnly && user.role !== "admin") return <Redirect to="/dashboard" />;
  return <Component />;
}

export default function App() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />

      <Route path="/dashboard">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/calendar">
        <ProtectedRoute component={CalendarPage} />
      </Route>
      <Route path="/appointments/book">
        <ProtectedRoute component={BookAppointment} />
      </Route>
      <Route path="/appointments/all">
        <ProtectedRoute component={AllAppointments} adminOnly />
      </Route>
      <Route path="/appointments/my">
        <ProtectedRoute component={MyAppointments} />
      </Route>
      <Route path="/appointments/:id">
        <ProtectedRoute component={AppointmentDetail} />
      </Route>
      <Route path="/admin/doctors">
        <ProtectedRoute component={AdminDoctors} adminOnly />
      </Route>
      <Route path="/doctors">
        <ProtectedRoute component={DoctorsList} />
      </Route>
      <Route path="/contact">
        <ProtectedRoute component={Contact} />
      </Route>

      <Route>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-300 mb-2">404</h1>
            <p className="text-gray-500">Page not found</p>
            <a href="/" className="mt-4 inline-block text-[#0f7bb5] hover:underline text-sm">
              Go home
            </a>
          </div>
        </div>
      </Route>
    </Switch>
  );
}

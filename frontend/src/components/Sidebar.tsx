import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  CalendarRange,
  ListChecks,
  PlusCircle,
  Stethoscope,
  ClipboardList,
  Users,
  Phone,
  LogOut,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export function Sidebar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const patientNav: NavItem[] = [
    { label: "Dashboard",        href: "/dashboard",        icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: "Book Appointment",  href: "/appointments/book", icon: <PlusCircle className="w-4 h-4" /> },
    { label: "My Appointments",   href: "/appointments/my",  icon: <ListChecks className="w-4 h-4" /> },
    { label: "Doctors",           href: "/doctors",          icon: <Stethoscope className="w-4 h-4" /> },
    { label: "Contact",           href: "/contact",          icon: <Phone className="w-4 h-4" /> },
  ];

  const doctorNav: NavItem[] = [
    { label: "Dashboard",      href: "/dashboard",        icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: "Calendar",       href: "/calendar",          icon: <CalendarRange className="w-4 h-4" /> },
    { label: "Appointments",   href: "/appointments/my",  icon: <ListChecks className="w-4 h-4" /> },
  ];

  const adminNav: NavItem[] = [
    { label: "Dashboard",        href: "/dashboard",        icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: "Manage Doctors",   href: "/admin/doctors",    icon: <Users className="w-4 h-4" /> },
    { label: "Doctor Directory", href: "/doctors",          icon: <Stethoscope className="w-4 h-4" /> },
    { label: "All Appointments", href: "/appointments/all", icon: <ClipboardList className="w-4 h-4" /> },
  ];

  const navItems =
    user?.role === "admin"  ? adminNav  :
    user?.role === "doctor" ? doctorNav :
    patientNav;

  return (
    <aside className="w-56 min-h-screen bg-white border-r border-gray-200 flex flex-col">
      <div className="px-5 py-5 border-b border-gray-100">
        <span className="text-xl font-bold text-[#0f7bb5]">MedApp</span>
      </div>

      <div className="px-5 py-4 border-b border-gray-100">
        <p className="text-sm font-semibold text-gray-800 truncate">{user?.name}</p>
        <p className="text-xs text-gray-400 capitalize mt-0.5">{user?.role}</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const active = location === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-[#0f7bb5]/10 text-[#0f7bb5]"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-gray-100">
        <button
          onClick={logout}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 w-full transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}

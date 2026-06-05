import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f8ff] via-white to-[#e0f4f1]">
      <header className="flex items-center justify-between px-8 py-5 border-b border-white/60 bg-white/70 backdrop-blur-sm">
        <span className="text-2xl font-bold text-[#0f7bb5]">MedApp</span>
        <div className="flex items-center gap-3">
          {user ? (
            <Link href="/dashboard" className="btn-primary">
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="btn-secondary">Login</Link>
              <Link href="/register" className="btn-primary">Register</Link>
            </>
          )}
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">
        <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-4">
          Book Medical Appointments<br />
          <span className="text-[#0f7bb5]">Across Saudi Arabia</span>
        </h1>
        <p className="text-lg text-gray-500 mb-8 max-w-xl mx-auto">
          Connecting patients with top doctors in Riyadh, Jeddah, and Dammam.
          Fast, easy, and available 24/7.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/register" className="btn-primary text-base px-6 py-3">
            Get Started
          </Link>
          <Link href="/login" className="btn-secondary text-base px-6 py-3">
            Login
          </Link>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-20 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: "Book Online",     desc: "Choose a doctor, pick a date and time, and confirm your appointment in seconds." },
          { title: "Track Status",    desc: "Get real-time updates — from pending to confirmed to completed." },
          { title: "Multiple Roles",  desc: "Separate dashboards for patients, doctors, and clinic admins." },
        ].map((f) => (
          <div key={f.title} className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
            <p className="text-sm text-gray-500">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

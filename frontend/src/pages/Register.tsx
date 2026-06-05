import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useRegister } from "@/api/hooks";
import { useAuth } from "@/hooks/use-auth";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const { login } = useAuth();
  const registerMutation = useRegister();
  const [, setLocation] = useLocation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    registerMutation.mutate(form, {
      onSuccess: (data) => {
        login(data.user, data.token);
        setLocation("/dashboard");
      },
      onError: (err) => setError(err.message),
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-3xl font-bold text-[#0f7bb5]">MedApp</span>
          <h1 className="text-xl font-semibold text-gray-800 mt-2">Create an account</h1>
          <p className="text-sm text-gray-500 mt-1">Register as a patient to book appointments</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          {[
            { id: "name",     label: "Full Name", type: "text",     placeholder: "Ahmed Al-Otaibi" },
            { id: "email",    label: "Email",      type: "email",    placeholder: "ahmed@example.com" },
            { id: "phone",    label: "Phone",      type: "tel",      placeholder: "+966 5X XXX XXXX" },
            { id: "password", label: "Password",   type: "password", placeholder: "Min 6 characters" },
          ].map((f) => (
            <div key={f.id}>
              <label className="form-label" htmlFor={f.id}>{f.label}</label>
              <input
                id={f.id}
                name={f.id}
                type={f.type}
                className="form-input"
                placeholder={f.placeholder}
                value={form[f.id as keyof typeof form]}
                onChange={handleChange}
                required
              />
            </div>
          ))}

          <button type="submit" className="btn-primary w-full py-2.5" disabled={registerMutation.isPending}>
            {registerMutation.isPending ? "Creating account..." : "Register"}
          </button>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="text-[#0f7bb5] hover:underline font-medium">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

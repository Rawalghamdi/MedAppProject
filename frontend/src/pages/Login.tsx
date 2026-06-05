import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useLogin } from "@/api/hooks";
import { useAuth } from "@/hooks/use-auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const loginMutation = useLogin();
  const [, setLocation] = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    loginMutation.mutate(
      { email, password },
      {
        onSuccess: (data) => {
          login(data.user, data.token);
          setLocation("/dashboard");
        },
        onError: (err) => setError(err.message),
      }
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-3xl font-bold text-[#0f7bb5]">MedApp</span>
          <h1 className="text-xl font-semibold text-gray-800 mt-2">Login to your account</h1>
          <p className="text-sm text-gray-500 mt-1">Enter your credentials to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="form-label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary w-full py-2.5" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? "Logging in..." : "Login"}
          </button>

          <p className="text-center text-sm text-gray-500">
            No account?{" "}
            <Link href="/register" className="text-[#0f7bb5] hover:underline font-medium">
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

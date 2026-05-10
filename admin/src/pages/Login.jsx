import { Lock } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) return <Navigate to="/" replace />;

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex min-h-screen items-center justify-center px-5 py-12">
      <form onSubmit={submit} className="admin-card w-full max-w-md rounded-[32px] p-8">
        <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-full bg-clay/20 text-clay">
          <Lock />
        </div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.32em] text-clay">Secure access</p>
        <h1 className="font-display text-4xl font-bold">Admin Login</h1>
        <p className="mt-3 text-sm leading-6 text-vellum/55">Use an admin-created account. Public registration is disabled.</p>
        <div className="mt-8 grid gap-4">
          <input className="input" type="email" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <input className="input" type="password" placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength="8" />
        </div>
        <button disabled={loading} className="mt-6 w-full rounded-full bg-vellum px-5 py-3 font-semibold text-ink transition hover:bg-gold disabled:opacity-60">
          {loading ? "Checking..." : "Login"}
        </button>
      </form>
    </section>
  );
}

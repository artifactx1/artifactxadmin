import { useState } from "react";
import { useRouter } from "next/router";
import api from "@/lib/api";

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.post("/admin/login", { username, password });
      router.replace("/admin/dashboard");
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-950">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm bg-ink-900 border border-white/[0.06] p-8 flex flex-col gap-5"
      >
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-[0.28em] text-neutral-600">
            Artifactx
          </span>
          <h1 className="text-xl font-bold text-white">Admin sign-in</h1>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
            Username
          </span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-ink-800 border border-white/[0.06] px-3 py-2 text-sm focus:outline-none focus:border-white/30"
            autoComplete="username"
            required
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
            Password
          </span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-ink-800 border border-white/[0.06] px-3 py-2 text-sm focus:outline-none focus:border-white/30"
            autoComplete="current-password"
            required
          />
        </label>

        {error && (
          <div className="text-xs text-red-400 border border-red-900/40 bg-red-950/20 px-3 py-2">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="bg-white text-black text-sm font-semibold py-2.5 hover:bg-neutral-200 transition-colors disabled:opacity-60 cursor-pointer"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

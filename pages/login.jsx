import { useState } from "react";
import { useRouter } from "next/router";
import api from "@/lib/api";

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [useRecovery, setUseRecovery] = useState(false);
  const [stage, setStage] = useState("creds"); // 'creds' | 'totp'
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const body = { username, password };
      if (stage === "totp") {
        if (useRecovery) body.recoveryCode = recoveryCode;
        else body.totpCode = totpCode;
      }
      await api.post("/admin/login", body);
      router.replace("/admin/dashboard");
    } catch (err) {
      const status = err?.response?.status;
      const data = err?.response?.data || {};
      if (data.requiresTotp) {
        setStage("totp");
        if (status === 401 && (totpCode || recoveryCode)) {
          setError(data.message || "Invalid code");
        }
      } else if (status) {
        setError(`${status} — ${data.message || data.error || "request failed"}`);
      } else {
        setError(`Network error — ${err.message || "could not reach server"}`);
      }
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
          <h1 className="text-xl font-bold text-white">
            {stage === "totp" ? "Two-factor code" : "Admin sign-in"}
          </h1>
        </div>

        {stage === "creds" && (
          <>
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
          </>
        )}

        {stage === "totp" && (
          <>
            <p className="text-[12px] text-neutral-500">
              Enter the 6-digit code from your authenticator app, or use a
              recovery code if you've lost access.
            </p>
            {!useRecovery ? (
              <label className="flex flex-col gap-1.5">
                <span className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                  Authenticator code
                </span>
                <input
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)}
                  className="bg-ink-800 border border-white/[0.06] px-3 py-2 text-sm font-mono tracking-[0.4em] focus:outline-none focus:border-white/30"
                  autoComplete="one-time-code"
                  inputMode="numeric"
                  maxLength={6}
                  autoFocus
                  required
                />
              </label>
            ) : (
              <label className="flex flex-col gap-1.5">
                <span className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                  Recovery code
                </span>
                <input
                  value={recoveryCode}
                  onChange={(e) => setRecoveryCode(e.target.value)}
                  className="bg-ink-800 border border-white/[0.06] px-3 py-2 text-sm font-mono focus:outline-none focus:border-white/30"
                  placeholder="abcd-1234-ef56"
                  autoFocus
                  required
                />
              </label>
            )}
            <button
              type="button"
              onClick={() => setUseRecovery(!useRecovery)}
              className="text-[11px] text-neutral-500 hover:text-white text-left cursor-pointer"
            >
              {useRecovery ? "← Use authenticator code" : "Lost your device? Use a recovery code →"}
            </button>
          </>
        )}

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
          {submitting ? "Signing in…" : stage === "totp" ? "Verify and sign in" : "Sign in"}
        </button>

        {stage === "totp" && (
          <button
            type="button"
            onClick={() => {
              setStage("creds");
              setTotpCode("");
              setRecoveryCode("");
              setError(null);
            }}
            className="text-[11px] text-neutral-500 hover:text-white cursor-pointer"
          >
            ← Start over
          </button>
        )}
      </form>
    </div>
  );
}

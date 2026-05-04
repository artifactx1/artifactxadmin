import { useState } from "react";
import useSWR from "swr";
import AdminLayout from "@/components/admin-layout";
import api, { fetcher } from "@/lib/api";

export default function TwoFactor() {
  const { data: status, mutate } = useSWR("/admin/totp/status", fetcher);
  const [setupData, setSetupData] = useState(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState(null);

  const startSetup = async () => {
    setBusy(true);
    try {
      const { data } = await api.post("/admin/totp/setup");
      setSetupData(data);
    } catch (err) {
      alert(err?.response?.data?.error || "Setup failed");
    } finally {
      setBusy(false);
    }
  };

  const enable = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post("/admin/totp/enable", { code });
      setRecoveryCodes(data.recoveryCodes);
      setSetupData(null);
      setCode("");
      mutate();
    } catch (err) {
      alert(err?.response?.data?.error || "Verification failed");
    } finally {
      setBusy(false);
    }
  };

  const disable = async () => {
    const c = prompt("Enter your current TOTP code to disable 2FA:");
    if (!c) return;
    setBusy(true);
    try {
      await api.post("/admin/totp/disable", { code: c });
      mutate();
      setRecoveryCodes(null);
    } catch (err) {
      alert(err?.response?.data?.error || "Disable failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminLayout title="Two-factor authentication">
      <div className="flex flex-col gap-6 max-w-2xl">
        <div className="bg-ink-900 border border-white/[0.06] p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-[11px] uppercase tracking-[0.22em] text-neutral-500">
                Status
              </h2>
              <p className="text-base font-semibold text-white mt-1">
                {status?.enabled ? "Enabled" : "Not enabled"}
              </p>
            </div>
            {status?.enabled ? (
              <button
                onClick={disable}
                disabled={busy}
                className="px-3 py-1.5 text-[12px] border border-red-900/60 text-red-300 hover:bg-red-900/20 cursor-pointer"
              >
                Disable
              </button>
            ) : setupData ? null : (
              <button
                onClick={startSetup}
                disabled={busy}
                className="bg-white text-black text-sm font-semibold px-4 py-2 hover:bg-neutral-200 disabled:opacity-50 cursor-pointer"
              >
                Set up 2FA
              </button>
            )}
          </div>
          <p className="text-[12px] text-neutral-500">
            When enabled, you'll be asked for a 6-digit code from your
            authenticator app on every sign-in. Keep your recovery codes safe —
            they're the only way back in if you lose your device.
          </p>
        </div>

        {setupData && (
          <div className="bg-ink-900 border border-white/[0.06] p-5 flex flex-col gap-4">
            <h2 className="text-[11px] uppercase tracking-[0.22em] text-neutral-500">
              Scan with an authenticator app
            </h2>
            <div className="flex flex-col md:flex-row gap-5 items-start">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={setupData.qrDataUrl}
                alt="TOTP QR"
                className="w-48 h-48 bg-white p-2"
              />
              <div className="flex-1 flex flex-col gap-3">
                <div className="text-[12px] text-neutral-500">
                  Or enter this secret manually:
                </div>
                <code className="bg-ink-800 border border-white/[0.06] px-3 py-2 font-mono text-[12px] text-neutral-200 break-all">
                  {setupData.secret}
                </code>
                <form onSubmit={enable} className="flex flex-col gap-2 mt-3">
                  <label className="text-[10px] uppercase tracking-[0.18em] text-neutral-600">
                    Enter the 6-digit code from your app
                  </label>
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="123456"
                    className="bg-ink-800 border border-white/[0.06] px-3 py-2 font-mono tracking-[0.4em] text-base focus:outline-none focus:border-white/30"
                    maxLength={6}
                    autoFocus
                    required
                  />
                  <button
                    type="submit"
                    disabled={busy || code.length < 6}
                    className="self-start bg-white text-black text-sm font-semibold px-4 py-2 hover:bg-neutral-200 disabled:opacity-50 cursor-pointer"
                  >
                    Verify and enable
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {recoveryCodes && (
          <div className="bg-ink-900 border border-yellow-900/40 p-5 flex flex-col gap-3">
            <h2 className="text-[11px] uppercase tracking-[0.22em] text-yellow-300">
              Save your recovery codes
            </h2>
            <p className="text-[12px] text-neutral-400">
              Each can be used once if you lose access to your authenticator.
              Store them somewhere safe — you won't see them again.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {recoveryCodes.map((c) => (
                <code
                  key={c}
                  className="bg-ink-800 border border-white/[0.06] px-2 py-1.5 font-mono text-[12px] text-neutral-200"
                >
                  {c}
                </code>
              ))}
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(recoveryCodes.join("\n"))}
              className="self-start px-3 py-1.5 text-[12px] border border-white/[0.06] hover:bg-white/[0.04] cursor-pointer"
            >
              Copy all
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

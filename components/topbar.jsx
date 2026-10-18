import { useState } from "react";
import { signOutAdmin } from "@/lib/logout";
import { useRouter } from "next/router";
import api from "@/lib/api";

export default function Topbar({ admin, onMenuClick }) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const onLogout = async () => {
    if (signingOut) return;
    setSigningOut(true);
    setLogoutError("");
    try {
      await signOutAdmin(api, (path) => router.replace(path));
    } catch {
      setLogoutError("Sign-out failed. Your session may still be active. Please try again.");
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <header className="relative h-12 border-b border-white/[0.06] bg-ink-900 flex items-center justify-between px-3 md:px-4 shrink-0">
      <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
        <button
          type="button"
          onClick={onMenuClick}
          className="md:hidden text-neutral-300 hover:text-white p-1.5 -ml-1 cursor-pointer"
          aria-label="Open menu"
        >
          {/* hamburger */}
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M3 6h14M3 10h14M3 14h14" strokeLinecap="round" />
          </svg>
        </button>
        <input
          placeholder="Search collections, drops, NFTs, users…"
          className="hidden sm:block w-full max-w-[420px] bg-ink-800 border border-white/[0.06] px-3 py-1.5 text-[13px] focus:outline-none focus:border-white/30"
        />
      </div>
      <div className="flex items-center gap-3 text-[12px] shrink-0">
        {admin ? (
          <>
            <span className="text-neutral-500 hidden sm:inline">
              {admin.username}{" "}
              <span className="text-neutral-700">({admin.role})</span>
            </span>
            <span className="text-neutral-400 sm:hidden truncate max-w-[120px]">
              {admin.username}
            </span>
            <button
              onClick={onLogout}
              disabled={signingOut}
              className="text-neutral-400 hover:text-white cursor-pointer disabled:opacity-50"
            >
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
            {logoutError && (
              <span role="alert" className="absolute top-full right-3 z-30 mt-2 max-w-xs border border-red-900/60 bg-ink-900 p-3 text-red-300 text-[12px]">
                {logoutError}
              </span>
            )}
          </>
        ) : (
          <span className="text-neutral-700">…</span>
        )}
      </div>
    </header>
  );
}


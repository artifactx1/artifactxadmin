import { useRouter } from "next/router";
import api from "@/lib/api";

export default function Topbar({ admin }) {
  const router = useRouter();
  const onLogout = async () => {
    try {
      await api.post("/admin/logout");
    } catch {}
    router.replace("/login");
  };

  return (
    <header className="h-12 border-b border-white/[0.06] bg-ink-900 flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-3">
        <input
          placeholder="Search collections, drops, NFTs, users…"
          className="w-[420px] bg-ink-800 border border-white/[0.06] px-3 py-1.5 text-[13px] focus:outline-none focus:border-white/30"
        />
      </div>
      <div className="flex items-center gap-3 text-[12px]">
        {admin ? (
          <>
            <span className="text-neutral-500">
              {admin.username}{" "}
              <span className="text-neutral-700">({admin.role})</span>
            </span>
            <button
              onClick={onLogout}
              className="text-neutral-400 hover:text-white cursor-pointer"
            >
              Sign out
            </button>
          </>
        ) : (
          <span className="text-neutral-700">…</span>
        )}
      </div>
    </header>
  );
}

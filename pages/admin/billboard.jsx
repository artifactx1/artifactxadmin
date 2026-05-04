import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import AdminLayout from "@/components/admin-layout";
import { MonoAddress } from "@/components/data-table";
import api, { fetcher } from "@/lib/api";

export default function Billboard() {
  const { data, error, mutate } = useSWR("/admin/billboards", fetcher);
  const billboards = data?.billboards || [];

  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const searchTimer = useRef(null);

  // Debounced search against /admin/collections/search.
  useEffect(() => {
    clearTimeout(searchTimer.current);
    if (!search.trim()) {
      setResults([]);
      return;
    }
    searchTimer.current = setTimeout(async () => {
      try {
        const { data } = await api.get(
          `/admin/collections/search?q=${encodeURIComponent(search.trim())}`
        );
        setResults(data?.results || []);
      } catch {
        setResults([]);
      }
    }, 250);
    return () => clearTimeout(searchTimer.current);
  }, [search]);

  const onAdd = async (item) => {
    try {
      await api.post("/admin/billboards", {
        type: "collection",
        referenceId: item.id,
      });
      setSearch("");
      setResults([]);
      mutate();
    } catch (err) {
      alert(err?.response?.data?.error || "Add failed");
    }
  };

  const onRemove = async (id) => {
    if (!confirm("Remove from billboard?")) return;
    try {
      await api.delete(`/admin/billboards/${id}`);
      mutate();
    } catch (err) {
      alert(err?.response?.data?.error || "Remove failed");
    }
  };

  const move = async (idx, dir) => {
    const next = [...billboards];
    const swap = idx + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    try {
      await api.post("/admin/billboards/reorder", {
        ids: next.map((b) => b.id),
      });
      mutate();
    } catch (err) {
      alert(err?.response?.data?.error || "Reorder failed");
    }
  };

  return (
    <AdminLayout title="Featured / Billboard">
      <div className="flex flex-col gap-6 max-w-3xl">
        {/* Add panel */}
        <div className="bg-ink-900 border border-white/[0.06] p-5 flex flex-col gap-3">
          <h2 className="text-[11px] uppercase tracking-[0.22em] text-neutral-500">
            Pin a collection or drop
          </h2>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or address…"
            className="bg-ink-800 border border-white/[0.06] px-3 py-2 text-[13px] focus:outline-none focus:border-white/30"
          />
          {results.length > 0 && (
            <div className="border border-white/[0.06] divide-y divide-white/[0.04]">
              {results.map((r) => {
                const alreadyPinned = billboards.some((b) => b.reference_id === r.id);
                return (
                  <div
                    key={r.id}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-white/[0.02]"
                  >
                    {r.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.image} alt="" className="w-10 h-10 object-cover bg-ink-700" />
                    ) : (
                      <div className="w-10 h-10 bg-ink-700" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-white text-[13px]">{r.name || "(unnamed)"}</span>
                        <span className="text-[10px] uppercase tracking-[0.14em] text-neutral-500">
                          {r.is_drop ? "drop" : "collection"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-neutral-600">
                        <MonoAddress value={r.address} />
                        <span>{r.network}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onAdd(r)}
                      disabled={alreadyPinned}
                      className="px-2 py-0.5 text-[11px] border border-white/[0.06] hover:bg-white/[0.04] disabled:opacity-40 cursor-pointer"
                    >
                      {alreadyPinned ? "Pinned" : "Pin"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pinned list */}
        <div className="bg-ink-900 border border-white/[0.06]">
          <div className="px-3 py-2 border-b border-white/[0.06] flex items-center justify-between">
            <h2 className="text-[11px] uppercase tracking-[0.22em] text-neutral-500">
              Pinned ({billboards.length} / 10)
            </h2>
            <span className="text-[11px] text-neutral-600">
              Display falls back to the collection name + image when no override is set.
            </span>
          </div>
          {billboards.length === 0 ? (
            <div className="px-3 py-10 text-center text-sm text-neutral-600">
              Nothing pinned yet. Search above.
            </div>
          ) : (
            <ul className="divide-y divide-white/[0.04]">
              {billboards.map((b, idx) => (
                <li key={b.id} className="flex items-center gap-3 px-3 py-3">
                  <span className="text-[11px] tabular-nums text-neutral-600 w-6">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  {b.display_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={b.display_image}
                      alt=""
                      className="w-12 h-12 object-cover bg-ink-700"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-ink-700" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-[13px] truncate">{b.display_title}</div>
                    <div className="flex items-center gap-2 text-[11px] text-neutral-600">
                      <MonoAddress value={b.collection_address} />
                      <span>{b.collection_network}</span>
                      <code className="font-mono text-neutral-700">
                        {b.suggested_link}
                      </code>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => move(idx, -1)}
                      disabled={idx === 0}
                      className="px-2 py-0.5 text-[11px] border border-white/[0.06] hover:bg-white/[0.04] disabled:opacity-40 cursor-pointer"
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => move(idx, 1)}
                      disabled={idx === billboards.length - 1}
                      className="px-2 py-0.5 text-[11px] border border-white/[0.06] hover:bg-white/[0.04] disabled:opacity-40 cursor-pointer"
                      title="Move down"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => onRemove(b.id)}
                      className="ml-2 px-2 py-0.5 text-[11px] border border-red-900/60 text-red-300 hover:bg-red-900/20 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {error && (
          <div className="text-xs text-red-400">
            {error?.response?.data?.error || error.message}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

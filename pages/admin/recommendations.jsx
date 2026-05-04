import useSWR from "swr";
import AdminLayout from "@/components/admin-layout";
import { MonoAddress } from "@/components/data-table";
import { fetcher } from "@/lib/api";

// Read-only first cut: shows what's currently surfaced and what's available.
// Drag-to-reorder lands in a follow-up.
export default function Recommendations() {
  const { data: current } = useSWR("/getting-recommendation-collection", fetcher);
  const { data: pool } = useSWR(
    "/get-All-Collection-for-Recommendation",
    fetcher
  );

  return (
    <AdminLayout title="Recommendations">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Pane title="Currently surfaced" rows={current?.collections || current || []} />
        <Pane title="Available pool" rows={pool?.collections || pool || []} />
      </div>
      <p className="mt-4 text-[12px] text-neutral-600">
        Drag-and-drop reorder + add/remove UI lands in a follow-up. For now this is a read-only view.
      </p>
    </AdminLayout>
  );
}

const Pane = ({ title, rows }) => (
  <div className="bg-ink-900 border border-white/[0.06]">
    <div className="px-3 py-2 border-b border-white/[0.06]">
      <h2 className="text-[11px] uppercase tracking-[0.22em] text-neutral-500">
        {title}{" "}
        <span className="text-neutral-700">({rows?.length ?? 0})</span>
      </h2>
    </div>
    <ul className="divide-y divide-white/[0.04]">
      {(rows || []).map((c, idx) => (
        <li key={c.id || c.address || idx} className="flex items-center gap-3 px-3 py-2">
          {c.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={c.image} alt="" className="w-8 h-8 object-cover bg-ink-700" />
          ) : (
            <div className="w-8 h-8 bg-ink-700" />
          )}
          <div className="min-w-0 flex-1">
            <div className="text-white text-[13px] truncate">{c.name || "(unnamed)"}</div>
            <MonoAddress value={c.address} />
          </div>
        </li>
      ))}
      {!rows?.length && (
        <li className="px-3 py-6 text-center text-neutral-600 text-sm">None</li>
      )}
    </ul>
  </div>
);

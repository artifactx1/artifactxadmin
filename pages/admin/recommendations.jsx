import useSWR from "swr";
import AdminLayout from "@/components/admin-layout";
import { MonoAddress } from "@/components/data-table";
import { fetcher } from "@/lib/api";

// Retain legacy links, but surface the API's retirement or loading failures.
export default function Recommendations() {
  const { data: current, error: currentError, isLoading: currentLoading } = useSWR("/getting-recommendation-collection", fetcher);
  const { data: pool, error: poolError, isLoading: poolLoading } = useSWR(
    "/get-All-Collection-for-Recommendation",
    fetcher
  );

  return (
    <AdminLayout title="Recommendations">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Pane title="Currently surfaced" rows={current?.collections || current || []} error={currentError} isLoading={currentLoading} />
        <Pane title="Available pool" rows={pool?.collections || pool || []} error={poolError} isLoading={poolLoading} />
      </div>
      <p className="mt-4 text-[12px] text-neutral-600">
        This legacy view is read-only. Current collection merchandising is managed
        through Collections and Featured / Billboard.
      </p>
    </AdminLayout>
  );
}

const Pane = ({ title, rows, error, isLoading }) => (
  <div className="bg-ink-900 border border-white/[0.06]">
    <div className="px-3 py-2 border-b border-white/[0.06]">
      <h2 className="text-[11px] uppercase tracking-[0.22em] text-neutral-500">
        {title}{" "}
        {!error && !isLoading && <span className="text-neutral-700">({rows?.length ?? 0})</span>}
      </h2>
    </div>
    {error ? (
      <p role="alert" className="px-3 py-6 text-sm text-red-400">
        {error.response?.status === 410
          ? "This legacy recommendations endpoint has been retired. Recommendations are unavailable here."
          : "Recommendations could not be loaded. Please try again later."}
      </p>
    ) : isLoading ? (
      <p role="status" className="px-3 py-6 text-sm text-neutral-600">Loading…</p>
    ) : (
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
    )}
  </div>
);


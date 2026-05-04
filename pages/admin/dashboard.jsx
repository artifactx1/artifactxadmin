import AdminLayout from "@/components/admin-layout";
import useSWR from "swr";
import { fetcher } from "@/lib/api";

const Tile = ({ label, value, hint, status }) => {
  const statusColor =
    status === "danger"
      ? "border-red-900/40"
      : status === "warn"
      ? "border-yellow-900/40"
      : "border-white/[0.06]";
  return (
    <div className={`bg-ink-900 border ${statusColor} p-5 flex flex-col gap-1`}>
      <span className="text-[10px] uppercase tracking-[0.22em] text-neutral-600">
        {label}
      </span>
      <span className="text-2xl font-bold text-white tabular-nums">
        {value ?? "—"}
      </span>
      {hint && <span className="text-[11px] text-neutral-600">{hint}</span>}
    </div>
  );
};

export default function Dashboard() {
  // GET /admin/dashboard/summary is Phase 1 — endpoint not yet built. The
  // page renders skeleton tiles until the API lands; SWR will pick up data
  // automatically once the route exists.
  const { data, error } = useSWR("/admin/dashboard/summary", fetcher, {
    shouldRetryOnError: false,
  });

  return (
    <AdminLayout title="Dashboard">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <Tile
          label="Live drops"
          value={data?.liveDrops}
          hint="Active claim phases right now"
        />
        <Tile
          label="New users (24h)"
          value={data?.newUsers24h}
        />
        <Tile
          label="Pending reports"
          value={data?.pendingReports}
          status={data?.pendingReports > 0 ? "warn" : null}
        />
        <Tile
          label="24h volume (ETH)"
          value={data?.volume24hEth?.toFixed?.(3)}
        />
        <Tile
          label="Indexer lag (max)"
          value={data?.indexerLagSec ? `${data.indexerLagSec}s` : null}
          status={data?.indexerLagSec > 300 ? "danger" : null}
          hint="NOW() − indexer_state.updated_at"
        />
        <Tile
          label="Last failed job"
          value={data?.lastFailedJob?.kind || null}
          hint={data?.lastFailedJob?.finished_at}
        />
      </div>

      {error && (
        <div className="mt-6 text-xs text-neutral-600">
          <code className="text-neutral-500">/admin/dashboard/summary</code> not
          implemented yet — see ADMIN_PANEL_SPEC.md §6 Phase 1.
        </div>
      )}
    </AdminLayout>
  );
}

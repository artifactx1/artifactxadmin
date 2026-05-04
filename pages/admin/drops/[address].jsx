import { useRouter } from "next/router";
import useSWR from "swr";
import AdminLayout from "@/components/admin-layout";
import api, { fetcher } from "@/lib/api";

const Surface = ({ label, ok }) => (
  <div
    className={`flex items-center justify-between px-3 py-2 border ${
      ok ? "border-emerald-900/40" : "border-red-900/40"
    } bg-ink-800`}
  >
    <span className="text-[12px] text-neutral-300">{label}</span>
    <span
      className={`text-[10px] uppercase tracking-[0.14em] ${
        ok ? "text-emerald-300" : "text-red-300"
      }`}
    >
      {ok ? "Visible" : "Hidden"}
    </span>
  </div>
);

const FindingRow = ({ f }) => {
  const tone =
    f.level === "error"
      ? "border-red-900/40 bg-red-950/20 text-red-200"
      : f.level === "warn"
      ? "border-yellow-900/40 bg-yellow-950/20 text-yellow-200"
      : "border-blue-900/40 bg-blue-950/20 text-blue-200";
  return (
    <div className={`px-3 py-2 text-[12px] border ${tone}`}>{f.message}</div>
  );
};

export default function DropDetail() {
  const router = useRouter();
  const { address } = router.query;

  const { data, error, mutate, isLoading } = useSWR(
    address ? `/admin/drops/${address}/diagnose` : null,
    fetcher
  );

  const onPushLive = async ({ startNow }) => {
    if (
      !confirm(
        startNow
          ? "Push this drop live AND set phase 0 startTime to NOW()?"
          : "Publish this drop (is_published = true)?"
      )
    )
      return;
    try {
      await api.post(`/admin/drops/${address}/push-live`, { startNow });
      mutate();
    } catch (err) {
      alert(err?.response?.data?.error || "Failed");
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Drop">
        <div className="text-sm text-neutral-600">Loading…</div>
      </AdminLayout>
    );
  }

  if (error || !data) {
    return (
      <AdminLayout title="Drop">
        <div className="text-sm text-red-400">
          {error?.response?.data?.error || "Drop not found"}
        </div>
      </AdminLayout>
    );
  }

  const { drop, surfaces, findings, server_now } = data;

  return (
    <AdminLayout title={drop.name || drop.address}>
      <div className="flex flex-col gap-6">
        {/* Hero strip */}
        <div className="bg-ink-900 border border-white/[0.06] p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Field label="Name">{drop.name}</Field>
          <Field label="Type">{drop.type}</Field>
          <Field label="Network">{drop.network}</Field>
          <Field label="Phases">{drop.phase_count}</Field>
          <Field label="Published">{drop.is_published ? "Yes" : "No"}</Field>
          <Field label="Deactivated">{drop.is_deactivated ? "Yes" : "No"}</Field>
          <Field label="Published at">
            {drop.published_at ? new Date(drop.published_at).toLocaleString() : "—"}
          </Field>
          <Field label="Server now">
            {server_now ? new Date(server_now).toLocaleString() : "—"}
          </Field>
        </div>

        {/* Visibility surfaces — the killer feature */}
        <div className="bg-ink-900 border border-white/[0.06] p-5 flex flex-col gap-3">
          <div>
            <h2 className="text-[11px] uppercase tracking-[0.22em] text-neutral-500">
              Where this drop is showing right now
            </h2>
            <p className="text-[12px] text-neutral-600">
              Each row evaluates the live filter on a public surface. If a row
              says “Hidden”, that surface won’t display this drop.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Surface label="Home / drops · Live tab" ok={surfaces.homeDropsLive} />
            <Surface
              label="Home / drops · Upcoming tab"
              ok={surfaces.homeDropsUpcoming}
            />
            <Surface
              label="/getAllDropsSQL?mint=live"
              ok={surfaces.getAllDropsLive}
            />
            <Surface
              label="/getAllDropsSQL?mint=soon"
              ok={surfaces.getAllDropsSoon}
            />
          </div>
        </div>

        {/* Findings */}
        <div className="bg-ink-900 border border-white/[0.06] p-5 flex flex-col gap-3">
          <h2 className="text-[11px] uppercase tracking-[0.22em] text-neutral-500">
            Findings
          </h2>
          {findings.length === 0 ? (
            <div className="text-[12px] text-neutral-500">
              No issues detected. The drop is configured to show on at least one
              surface.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {findings.map((f, idx) => (
                <FindingRow key={idx} f={f} />
              ))}
            </div>
          )}
        </div>

        {/* Phase 0 detail */}
        <div className="bg-ink-900 border border-white/[0.06] p-5 flex flex-col gap-3">
          <h2 className="text-[11px] uppercase tracking-[0.22em] text-neutral-500">
            Phase 0
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Field label="isOwner">{String(drop.phase0?.isOwner ?? "—")}</Field>
            <Field label="startTime">{drop.phase0?.startTime || "—"}</Field>
            <Field label="endTime">{drop.phase0?.endTime || "—"}</Field>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-ink-900 border border-white/[0.06] p-5 flex flex-col gap-3">
          <h2 className="text-[11px] uppercase tracking-[0.22em] text-neutral-500">
            Actions
          </h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onPushLive({ startNow: false })}
              disabled={drop.is_published}
              className="px-3 py-1.5 text-[12px] border border-white/[0.06] hover:bg-white/[0.04] disabled:opacity-40 cursor-pointer"
            >
              {drop.is_published ? "Already published" : "Publish"}
            </button>
            <button
              onClick={() => onPushLive({ startNow: true })}
              className="px-3 py-1.5 text-[12px] border border-white/[0.06] hover:bg-white/[0.04] cursor-pointer"
            >
              Push live (publish + start now)
            </button>
          </div>
          <p className="text-[11px] text-neutral-600">
            Phase editing UI lands in a follow-up. For now, edit
            claim_condition via the existing creator-studio flow or the API.
          </p>
        </div>

        {/* Raw claim_condition */}
        <details className="bg-ink-900 border border-white/[0.06] p-5">
          <summary className="cursor-pointer text-[11px] uppercase tracking-[0.22em] text-neutral-500">
            Raw claim_condition JSON
          </summary>
          <pre className="mt-3 text-[11px] text-neutral-400 overflow-x-auto">
            {JSON.stringify(drop.claim_condition, null, 2)}
          </pre>
        </details>
      </div>
    </AdminLayout>
  );
}

const Field = ({ label, children }) => (
  <div className="flex flex-col gap-1">
    <span className="text-[10px] uppercase tracking-[0.18em] text-neutral-600">
      {label}
    </span>
    <span className="text-[13px] text-neutral-200">{children ?? "—"}</span>
  </div>
);

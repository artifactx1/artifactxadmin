import { useRouter } from "next/router";
import useSWR from "swr";
import AdminLayout from "@/components/admin-layout";
import api, { fetcher } from "@/lib/api";

const Field = ({ label, children, mono }) => (
  <div className="flex flex-col gap-1">
    <span className="text-[10px] uppercase tracking-[0.18em] text-neutral-600">
      {label}
    </span>
    <span className={`text-[13px] text-neutral-200 ${mono ? "font-mono" : ""}`}>
      {children ?? "—"}
    </span>
  </div>
);

const FlagToggle = ({ label, value, onChange, danger }) => (
  <button
    onClick={() => onChange(!value)}
    className={`px-3 py-2 text-[12px] uppercase tracking-[0.14em] border transition-colors cursor-pointer ${
      value
        ? danger
          ? "bg-red-900/40 border-red-900/60 text-red-200"
          : "bg-emerald-900/40 border-emerald-900/60 text-emerald-200"
        : "bg-ink-800 border-white/[0.06] text-neutral-500 hover:text-white"
    }`}
    title={`Toggle ${label}`}
  >
    {label}: {value ? "ON" : "OFF"}
  </button>
);

export default function CollectionDetail() {
  const router = useRouter();
  const { address } = router.query;

  const { data, error, mutate, isLoading } = useSWR(
    address ? `/admin/collections/${address}` : null,
    fetcher
  );
  const c = data?.collection;

  const updateFlag = async (key, value) => {
    try {
      await api.patch(`/admin/collections/${address}/flags`, { [key]: value });
      mutate();
    } catch (err) {
      alert(err?.response?.data?.error || "Update failed");
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Collection">
        <div className="text-sm text-neutral-600">Loading…</div>
      </AdminLayout>
    );
  }

  if (error || !c) {
    return (
      <AdminLayout title="Collection">
        <div className="text-sm text-red-400">
          {error?.response?.data?.error || "Collection not found"}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={c.name || c.address}>
      <div className="flex flex-col gap-6">
        {/* Hero */}
        <div className="flex gap-5 bg-ink-900 border border-white/[0.06] p-5">
          {c.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={c.image} alt="" className="w-32 h-32 object-cover bg-ink-700 shrink-0" />
          ) : (
            <div className="w-32 h-32 bg-ink-700 shrink-0" />
          )}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4">
            <Field label="Name">{c.name}</Field>
            <Field label="Address" mono>
              {c.address}
            </Field>
            <Field label="Network">{c.network}</Field>
            <Field label="Type">{c.type}</Field>
            <Field label="Chain ID">{c.chain_id}</Field>
            <Field label="Created">
              {c.created_at ? new Date(c.created_at).toLocaleString() : "—"}
            </Field>
            <Field label="Items">{c.total_nfts}</Field>
            <Field label="Floor">
              {c.floor_price != null ? `${Number(c.floor_price).toFixed(4)} ETH` : "—"}
            </Field>
            <Field label="Total volume">
              {c.total_volume != null
                ? `${Number(c.total_volume).toFixed(3)} ETH`
                : "—"}
            </Field>
            <Field label="24h volume">
              {c.volume_24h != null ? `${Number(c.volume_24h).toFixed(3)} ETH` : "—"}
            </Field>
            <Field label="24h activity">{c.activity_24h ?? "—"}</Field>
            <Field label="Royalty %">{c.royality_percent ?? "—"}</Field>
          </div>
        </div>

        {/* Flag toggles */}
        <div className="bg-ink-900 border border-white/[0.06] p-5 flex flex-col gap-3">
          <h2 className="text-[11px] uppercase tracking-[0.22em] text-neutral-500">
            Flags
          </h2>
          <div className="flex flex-wrap gap-2">
            <FlagToggle
              label="Featured"
              value={!!c.is_featured}
              onChange={(v) => updateFlag("is_featured", v)}
            />
            <FlagToggle
              label="Historical"
              value={!!c.is_historical}
              onChange={(v) => updateFlag("is_historical", v)}
            />
            <FlagToggle
              label="Published"
              value={!!c.is_published}
              onChange={(v) => updateFlag("is_published", v)}
            />
            <FlagToggle
              label="Deactivated"
              value={!!c.is_deactivated}
              onChange={(v) => {
                if (
                  !c.is_deactivated &&
                  !confirm(
                    "Soft-hide this collection? Public surfaces will stop showing it. You can reverse this from Takedowns."
                  )
                )
                  return;
                updateFlag("is_deactivated", v);
              }}
              danger
            />
          </div>
        </div>

        {/* Background-job actions */}
        <div className="bg-ink-900 border border-white/[0.06] p-5 flex flex-col gap-3">
          <h2 className="text-[11px] uppercase tracking-[0.22em] text-neutral-500">
            Maintenance jobs
          </h2>
          <p className="text-[12px] text-neutral-600">
            Long ops queue as background jobs and stream progress in System &gt; Background jobs.
          </p>
          <div className="flex flex-wrap gap-2">
            <JobButton
              label="Reindex NFTs"
              kind="collection.reindex"
              params={{ address: c.address, chain: c.network, type: c.type }}
              confirm={`Reindex every NFT for ${c.name}? Inserts are idempotent so this is safe to re-run.`}
            />
            <JobButton
              label="Refresh stats from Alchemy"
              kind="collection.refresh-stats"
              params={{ address: c.address, network: c.network }}
            />
            <JobButton
              label="Refresh metadata for every NFT"
              kind="collection.refresh-metadata"
              params={{ address: c.address, network: c.network }}
              confirm={`Trigger Alchemy refresh for every NFT in ${c.name}? Can take many minutes for large collections.`}
            />
            <JobButton
              label="Cancel all listings"
              kind="collection.cancel-all-listings"
              params={{ address: c.address }}
              confirm={`Cancel every active listing on ${c.name}? Cannot be undone.`}
              danger
            />
          </div>
        </div>

        {/* Drop-specific shortcut */}
        {c.is_drop && (
          <div className="bg-ink-900 border border-white/[0.06] p-5">
            <h2 className="text-[11px] uppercase tracking-[0.22em] text-neutral-500 mb-2">
              Drop tools
            </h2>
            <p className="text-[13px] text-neutral-500 mb-3">
              Use the Drops module for claim-phase editing and the diagnostics tab.
            </p>
            <button
              onClick={() => router.push(`/admin/drops/${c.address}`)}
              className="px-3 py-1.5 text-[12px] border border-white/[0.06] hover:bg-white/[0.04] cursor-pointer"
            >
              Open in Drops →
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

// Single-click job launcher. Confirms (if asked), POSTs /admin/jobs, then
// kicks the user over to the jobs page so they can watch progress.
function JobButton({ label, kind, params, confirm: confirmMsg, danger }) {
  const router = useRouter();
  const onClick = async () => {
    if (confirmMsg && !confirm(confirmMsg)) return;
    try {
      await api.post("/admin/jobs", { kind, params });
      router.push("/admin/system/jobs");
    } catch (err) {
      alert(err?.response?.data?.error || "Failed to enqueue job");
    }
  };
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-[12px] border cursor-pointer ${
        danger
          ? "border-red-900/60 text-red-300 hover:bg-red-900/20"
          : "border-white/[0.06] hover:bg-white/[0.04]"
      }`}
    >
      {label}
    </button>
  );
}

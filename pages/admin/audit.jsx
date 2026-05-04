import { useState } from "react";
import useSWR from "swr";
import AdminLayout from "@/components/admin-layout";
import { DataTable } from "@/components/data-table";
import { fetcher } from "@/lib/api";

export default function AuditLog() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    action: "",
    targetType: "",
    targetId: "",
  });

  const params = new URLSearchParams({ page: String(page), pageSize: "50" });
  for (const [k, v] of Object.entries(filters)) {
    if (v?.trim()) params.set(k, v.trim());
  }

  const { data, error, isLoading } = useSWR(
    `/admin/audit?${params.toString()}`,
    fetcher,
    { keepPreviousData: true }
  );

  const [expandedId, setExpandedId] = useState(null);

  const columns = [
    {
      key: "created_at",
      label: "When",
      width: 170,
      render: (r) => (
        <span className="text-neutral-500 text-[11px]">
          {new Date(r.created_at).toLocaleString()}
        </span>
      ),
    },
    { key: "admin_username", label: "Admin" },
    {
      key: "action",
      label: "Action",
      render: (r) => (
        <code className="font-mono text-[11px] text-neutral-300">{r.action}</code>
      ),
    },
    {
      key: "target",
      label: "Target",
      render: (r) =>
        r.target_type ? (
          <span className="text-neutral-400 text-[12px]">
            {r.target_type}
            <span className="text-neutral-700"> · </span>
            <code className="font-mono text-[11px]">{r.target_id}</code>
          </span>
        ) : (
          "—"
        ),
    },
    {
      key: "ip_address",
      label: "IP",
      render: (r) => (
        <span className="font-mono text-[11px] text-neutral-600">
          {r.ip_address || "—"}
        </span>
      ),
    },
  ];

  return (
    <AdminLayout title="Audit log">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-3 items-end">
          <FilterInput
            label="Action contains"
            value={filters.action}
            onChange={(v) => {
              setFilters((f) => ({ ...f, action: v }));
              setPage(1);
            }}
            placeholder="e.g. collection.flags"
          />
          <FilterInput
            label="Target type"
            value={filters.targetType}
            onChange={(v) => {
              setFilters((f) => ({ ...f, targetType: v }));
              setPage(1);
            }}
            placeholder="collection / drop / nft / user"
          />
          <FilterInput
            label="Target id"
            value={filters.targetId}
            onChange={(v) => {
              setFilters((f) => ({ ...f, targetId: v }));
              setPage(1);
            }}
            placeholder="address or id"
          />
        </div>

        <DataTable
          columns={columns}
          rows={data?.entries || []}
          emptyMessage={isLoading ? "Loading…" : "No audit entries match"}
          onRowClick={(row) => setExpandedId(expandedId === row.id ? null : row.id)}
        />

        {/* Inline detail for the selected row — keeps page state simple. */}
        {expandedId && data?.entries && (
          <DetailDrawer
            entry={data.entries.find((e) => e.id === expandedId)}
            onClose={() => setExpandedId(null)}
          />
        )}

        <div className="flex items-center justify-between text-[12px] text-neutral-500">
          <span>
            {data
              ? `Page ${data.page} — showing ${data.entries?.length ?? 0} of ${data.total} entries`
              : "—"}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 border border-white/[0.06] hover:bg-white/[0.04] disabled:opacity-40 cursor-pointer"
            >
              Prev
            </button>
            <button
              disabled={!data || page * 50 >= data.total}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 border border-white/[0.06] hover:bg-white/[0.04] disabled:opacity-40 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>

        {error && (
          <div className="text-xs text-red-400">
            Failed to load: {error?.response?.data?.error || error.message}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

const FilterInput = ({ label, value, onChange, placeholder }) => (
  <label className="flex flex-col gap-1">
    <span className="text-[10px] uppercase tracking-[0.18em] text-neutral-600">
      {label}
    </span>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="bg-ink-800 border border-white/[0.06] px-3 py-1.5 text-[13px] focus:outline-none focus:border-white/30"
    />
  </label>
);

const DetailDrawer = ({ entry, onClose }) => {
  if (!entry) return null;
  return (
    <div className="bg-ink-900 border border-white/[0.06] p-5 flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-semibold text-white">
            {entry.action}
          </h3>
          <p className="text-[12px] text-neutral-500">
            {entry.admin_username} ·{" "}
            {new Date(entry.created_at).toLocaleString()} ·{" "}
            <code className="font-mono">{entry.ip_address || "no ip"}</code>
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-neutral-500 hover:text-white text-[12px] cursor-pointer"
        >
          Close
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <DiffPanel title="Before" data={entry.before_state} />
        <DiffPanel title="After" data={entry.after_state} />
      </div>

      {entry.metadata && (
        <details className="border-t border-white/[0.06] pt-3">
          <summary className="cursor-pointer text-[11px] uppercase tracking-[0.18em] text-neutral-500">
            Metadata
          </summary>
          <pre className="mt-2 text-[11px] text-neutral-400 overflow-x-auto">
            {JSON.stringify(entry.metadata, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
};

const DiffPanel = ({ title, data }) => (
  <div className="bg-ink-800 border border-white/[0.06] p-3">
    <span className="text-[10px] uppercase tracking-[0.18em] text-neutral-500">
      {title}
    </span>
    <pre className="mt-2 text-[11px] text-neutral-300 overflow-x-auto">
      {data ? JSON.stringify(data, null, 2) : "(none)"}
    </pre>
  </div>
);

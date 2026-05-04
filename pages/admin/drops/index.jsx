import { useState } from "react";
import useSWR from "swr";
import AdminLayout from "@/components/admin-layout";
import { DataTable, StatusPill, MonoAddress } from "@/components/data-table";
import { fetcher } from "@/lib/api";

const STATUS_OPTIONS = [
  { value: "", label: "Any" },
  { value: "live", label: "Live" },
  { value: "upcoming", label: "Upcoming" },
  { value: "ended", label: "Ended" },
  { value: "no_phases", label: "No phases" },
  { value: "no_public_phase", label: "No public phase" },
];

const STATUS_COLORS = {
  live: "bg-emerald-900/40 text-emerald-300",
  upcoming: "bg-blue-900/40 text-blue-300",
  ended: "bg-neutral-700 text-neutral-400",
  no_phases: "bg-yellow-900/40 text-yellow-300",
  no_public_phase: "bg-yellow-900/40 text-yellow-300",
};

export default function DropsList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const params = new URLSearchParams({ page: String(page), pageSize: "50" });
  if (search.trim()) params.set("search", search.trim());
  if (status) params.set("status", status);

  const { data, error, isLoading } = useSWR(
    `/admin/drops?${params.toString()}`,
    fetcher,
    { keepPreviousData: true }
  );

  const columns = [
    {
      key: "image",
      label: "",
      width: 48,
      render: (row) =>
        row.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={row.image} alt="" className="w-9 h-9 object-cover bg-ink-700" />
        ) : (
          <div className="w-9 h-9 bg-ink-700" />
        ),
    },
    {
      key: "name",
      label: "Name",
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-white font-medium">{row.name || "(unnamed)"}</span>
          <MonoAddress value={row.address} />
        </div>
      ),
    },
    { key: "network", label: "Network" },
    { key: "type", label: "Type" },
    {
      key: "phase_status",
      label: "Status",
      render: (r) => (
        <span
          className={`inline-block px-1.5 py-0.5 text-[10px] uppercase tracking-[0.14em] ${
            STATUS_COLORS[r.phase_status] || "bg-white/[0.04] text-neutral-500"
          }`}
        >
          {r.phase_status?.replace(/_/g, " ") || "—"}
        </span>
      ),
    },
    { key: "phase_count", label: "Phases", align: "right" },
    {
      key: "is_published",
      label: "Pub",
      render: (r) => <StatusPill active={r.is_published} />,
    },
  ];

  return (
    <AdminLayout title="Drops">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-3 items-end">
          <label className="flex flex-col gap-1 flex-1 min-w-[260px]">
            <span className="text-[10px] uppercase tracking-[0.18em] text-neutral-600">
              Search name or address
            </span>
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search…"
              className="bg-ink-800 border border-white/[0.06] px-3 py-1.5 text-[13px] focus:outline-none focus:border-white/30"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-[0.18em] text-neutral-600">
              Status
            </span>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="bg-ink-800 border border-white/[0.06] px-2 py-1.5 text-[13px] focus:outline-none focus:border-white/30"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value} className="bg-ink-800">
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <DataTable
          columns={columns}
          rows={data?.drops || []}
          emptyMessage={isLoading ? "Loading…" : "No drops match these filters"}
          onRowClick={(row) => {
            window.location.href = `/admin/drops/${row.address}`;
          }}
        />

        <div className="flex items-center justify-between text-[12px] text-neutral-500">
          <span>
            {data
              ? `Page ${data.page} — showing ${data.drops?.length ?? 0} of ${data.total} drops`
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

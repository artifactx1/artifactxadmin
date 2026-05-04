import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import AdminLayout from "@/components/admin-layout";
import { DataTable, StatusPill, MonoAddress } from "@/components/data-table";
import { fetcher } from "@/lib/api";

const FilterSelect = ({ label, value, onChange, options }) => (
  <label className="flex flex-col gap-1">
    <span className="text-[10px] uppercase tracking-[0.18em] text-neutral-600">
      {label}
    </span>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-ink-800 border border-white/[0.06] px-2 py-1.5 text-[13px] focus:outline-none focus:border-white/30"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value} className="bg-ink-800">
          {o.label}
        </option>
      ))}
    </select>
  </label>
);

const TRI = [
  { value: "all", label: "Any" },
  { value: "true", label: "Yes" },
  { value: "false", label: "No" },
];

export default function CollectionsList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    isDrop: "all",
    isFeatured: "all",
    isHistorical: "all",
    isDeactivated: "all",
    type: "all",
  });

  const params = new URLSearchParams({
    page: String(page),
    pageSize: "50",
  });
  if (search.trim()) params.set("search", search.trim());
  for (const [k, v] of Object.entries(filters)) {
    if (v && v !== "all") params.set(k, v);
  }

  const { data, error, isLoading } = useSWR(
    `/admin/collections?${params.toString()}`,
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
      key: "is_drop",
      label: "Drop",
      render: (r) => <StatusPill active={r.is_drop} />,
    },
    {
      key: "is_published",
      label: "Pub",
      render: (r) => <StatusPill active={r.is_published} />,
    },
    {
      key: "is_featured",
      label: "Featured",
      render: (r) => <StatusPill active={r.is_featured} />,
    },
    { key: "total_nfts", label: "Items", align: "right" },
    {
      key: "floor_price",
      label: "Floor",
      align: "right",
      render: (r) =>
        r.floor_price != null ? `${Number(r.floor_price).toFixed(3)} ETH` : "—",
    },
  ];

  return (
    <AdminLayout title="Collections">
      <div className="flex flex-col gap-4">
        {/* Filter strip */}
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
          <FilterSelect
            label="Drop"
            value={filters.isDrop}
            onChange={(v) => {
              setFilters((f) => ({ ...f, isDrop: v }));
              setPage(1);
            }}
            options={TRI}
          />
          <FilterSelect
            label="Featured"
            value={filters.isFeatured}
            onChange={(v) => {
              setFilters((f) => ({ ...f, isFeatured: v }));
              setPage(1);
            }}
            options={TRI}
          />
          <FilterSelect
            label="Historical"
            value={filters.isHistorical}
            onChange={(v) => {
              setFilters((f) => ({ ...f, isHistorical: v }));
              setPage(1);
            }}
            options={TRI}
          />
          <FilterSelect
            label="Deactivated"
            value={filters.isDeactivated}
            onChange={(v) => {
              setFilters((f) => ({ ...f, isDeactivated: v }));
              setPage(1);
            }}
            options={TRI}
          />
          <FilterSelect
            label="Type"
            value={filters.type}
            onChange={(v) => {
              setFilters((f) => ({ ...f, type: v }));
              setPage(1);
            }}
            options={[
              { value: "all", label: "Any" },
              { value: "ERC721", label: "ERC721" },
              { value: "ERC1155", label: "ERC1155" },
            ]}
          />
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          rows={data?.collections || []}
          emptyMessage={isLoading ? "Loading…" : "No collections match these filters"}
          onRowClick={(row) => {
            window.location.href = `/admin/collections/${row.address}`;
          }}
        />

        {/* Footer / pagination */}
        <div className="flex items-center justify-between text-[12px] text-neutral-500">
          <span>
            {data
              ? `Page ${data.page} — showing ${data.collections?.length ?? 0} of ${data.total} collections`
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

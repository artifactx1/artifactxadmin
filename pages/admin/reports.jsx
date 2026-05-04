import { useState } from "react";
import useSWR from "swr";
import AdminLayout from "@/components/admin-layout";
import { ListShell, SelectFilter } from "@/components/list-shell";
import api, { fetcher } from "@/lib/api";

const STATUS_OPTIONS = [
  { value: "", label: "Any" },
  { value: "pending", label: "Pending" },
  { value: "dismissed", label: "Dismissed" },
  { value: "resolved", label: "Resolved" },
];

export default function Reports() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");

  const params = new URLSearchParams({ page: String(page), pageSize: "50" });
  if (status) params.set("status", status);

  const { data, error, isLoading, mutate } = useSWR(
    `/admin/reports-list?${params.toString()}`,
    fetcher,
    { keepPreviousData: true }
  );

  const act = async (id, kind) => {
    if (!confirm(`Mark report ${id} as ${kind}?`)) return;
    try {
      await api.post(`/admin/reports-list/${id}/${kind}`);
      mutate();
    } catch (err) {
      alert(err?.response?.data?.error || "Failed");
    }
  };

  const columns = [
    {
      key: "created_at",
      label: "When",
      width: 170,
      render: (r) => (
        <span className="text-neutral-500 text-[11px]">
          {r.created_at ? new Date(r.created_at).toLocaleString() : "—"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (r) => (
        <span
          className={`inline-block px-1.5 py-0.5 text-[10px] uppercase tracking-[0.14em] ${
            (r.status || "pending") === "pending"
              ? "bg-yellow-900/40 text-yellow-300"
              : (r.status || "") === "resolved"
              ? "bg-emerald-900/40 text-emerald-300"
              : "bg-white/[0.04] text-neutral-500"
          }`}
        >
          {r.status || "pending"}
        </span>
      ),
    },
    { key: "reason", label: "Reason" },
    { key: "collection_id", label: "Collection" },
    { key: "drop_id", label: "Drop" },
    { key: "nft_id", label: "NFT" },
    {
      key: "actions",
      label: "",
      render: (r) =>
        (r.status || "pending") === "pending" ? (
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                act(r.id, "dismiss");
              }}
              className="px-2 py-0.5 text-[11px] border border-white/[0.06] hover:bg-white/[0.04] cursor-pointer"
            >
              Dismiss
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                act(r.id, "resolve");
              }}
              className="px-2 py-0.5 text-[11px] border border-emerald-900/60 text-emerald-300 hover:bg-emerald-900/20 cursor-pointer"
            >
              Resolve
            </button>
          </div>
        ) : null,
    },
  ];

  return (
    <AdminLayout title="Reports">
      <ListShell
        filters={
          <SelectFilter
            label="Status"
            value={status}
            onChange={(v) => {
              setStatus(v);
              setPage(1);
            }}
            options={STATUS_OPTIONS}
          />
        }
        columns={columns}
        rows={data?.reports}
        total={data?.total}
        page={page}
        onPageChange={setPage}
        isLoading={isLoading}
        error={error}
      />
    </AdminLayout>
  );
}

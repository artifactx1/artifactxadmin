import { useState } from "react";
import useSWR from "swr";
import AdminLayout from "@/components/admin-layout";
import { ListShell } from "@/components/list-shell";
import api, { fetcher } from "@/lib/api";

export default function Offers() {
  const [page, setPage] = useState(1);
  const { data, error, isLoading, mutate } = useSWR(
    `/admin/offers?page=${page}&pageSize=50`,
    fetcher,
    { keepPreviousData: true }
  );

  const onCancel = async (id) => {
    if (!confirm(`Admin-cancel offer ${id}?`)) return;
    try {
      await api.delete(`/admin/offers/${id}`);
      mutate();
    } catch (err) {
      alert(err?.response?.data?.error || "Cancel failed");
    }
  };

  const columns =
    data?.offers?.length > 0
      ? [
          ...Object.keys(data.offers[0])
            .slice(0, 6)
            .map((k) => ({
              key: k,
              label: k,
              render: (r) => {
                const v = r[k];
                if (v == null) return "—";
                if (typeof v === "object") return JSON.stringify(v).slice(0, 40);
                return String(v).slice(0, 40);
              },
            })),
          {
            key: "actions",
            label: "",
            render: (r) => (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCancel(r.id);
                }}
                className="px-2 py-0.5 text-[11px] border border-red-900/60 text-red-300 hover:bg-red-900/20 cursor-pointer"
              >
                Cancel
              </button>
            ),
          },
        ]
      : [{ key: "id", label: "—" }];

  return (
    <AdminLayout title="Offers">
      <ListShell
        filters={null}
        columns={columns}
        rows={data?.offers}
        total={data?.total}
        page={page}
        onPageChange={setPage}
        isLoading={isLoading}
        error={error}
        emptyMessage="No offers"
      />
    </AdminLayout>
  );
}

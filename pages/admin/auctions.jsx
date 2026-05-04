import { useState } from "react";
import useSWR from "swr";
import AdminLayout from "@/components/admin-layout";
import { ListShell } from "@/components/list-shell";
import { fetcher } from "@/lib/api";

export default function Auctions() {
  const [page, setPage] = useState(1);
  const { data, error, isLoading } = useSWR(
    `/admin/auctions?page=${page}&pageSize=50`,
    fetcher,
    { keepPreviousData: true }
  );

  // Render raw row contents — schema may vary across deploys.
  const columns =
    data?.auctions?.length > 0
      ? Object.keys(data.auctions[0])
          .slice(0, 8)
          .map((k) => ({
            key: k,
            label: k,
            render: (r) => {
              const v = r[k];
              if (v == null) return "—";
              if (typeof v === "object") return JSON.stringify(v).slice(0, 40);
              if (k.includes("_at") || k === "created_at" || k === "expires_at")
                return (
                  <span className="text-neutral-500 text-[11px]">
                    {new Date(v).toLocaleString()}
                  </span>
                );
              return String(v).slice(0, 40);
            },
          }))
      : [{ key: "id", label: "—" }];

  return (
    <AdminLayout title="Auctions">
      <ListShell
        filters={null}
        columns={columns}
        rows={data?.auctions}
        total={data?.total}
        page={page}
        onPageChange={setPage}
        isLoading={isLoading}
        error={error}
        emptyMessage="No auctions"
      />
    </AdminLayout>
  );
}

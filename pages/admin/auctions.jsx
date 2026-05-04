import { useState } from "react";
import useSWR from "swr";
import AdminLayout from "@/components/admin-layout";
import { MonoAddress } from "@/components/data-table";
import { ListShell } from "@/components/list-shell";
import { fetcher } from "@/lib/api";

export default function Auctions() {
  const [page, setPage] = useState(1);
  const { data, error, isLoading } = useSWR(
    `/admin/auctions?page=${page}&pageSize=50`,
    fetcher,
    { keepPreviousData: true }
  );

  const columns = [
    {
      key: "image",
      label: "",
      width: 48,
      render: (r) => {
        const src = r.nft_thumbnail || r.nft_image || r.nft_preview;
        return src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" className="w-9 h-9 object-cover bg-ink-700" />
        ) : (
          <div className="w-9 h-9 bg-ink-700" />
        );
      },
    },
    {
      key: "nft_name",
      label: "NFT",
      render: (r) => (
        <div className="flex flex-col">
          <span className="text-white">
            {r.nft_name || `#${r.collection_id}` || "(unknown)"}
          </span>
          <span className="text-neutral-600 text-[11px]">
            <MonoAddress value={r.collection_address} /> · #{r.collection_id}
          </span>
        </div>
      ),
    },
    {
      key: "seller_address",
      label: "Seller",
      render: (r) => <MonoAddress value={r.seller_address} />,
    },
    {
      key: "reserve_price",
      label: "Reserve",
      align: "right",
      render: (r) =>
        r.reserve_price != null
          ? `${Number(r.reserve_price).toFixed(4)} ETH`
          : "—",
    },
    { key: "quantity", label: "Qty", align: "right" },
    { key: "token_type", label: "Type" },
    {
      key: "status",
      label: "Status",
      render: (r) => (
        <span className="text-[11px] uppercase tracking-[0.14em] text-neutral-500">
          {r.status || "—"}
        </span>
      ),
    },
    {
      key: "end_time",
      label: "Ends",
      render: (r) => (
        <span className="text-neutral-500 text-[11px]">
          {r.end_time ? new Date(r.end_time).toLocaleString() : "—"}
        </span>
      ),
    },
  ];

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

import { useState } from "react";
import useSWR from "swr";
import AdminLayout from "@/components/admin-layout";
import { MonoAddress } from "@/components/data-table";
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
          <span className="text-white">{r.nft_name || "(deleted NFT)"}</span>
          <span className="text-neutral-600 text-[11px]">
            <MonoAddress value={r.collection_address} />{" "}
            {r.token_id != null ? `· #${r.token_id}` : ""}
          </span>
        </div>
      ),
    },
    {
      key: "offerer",
      label: "Offerer",
      render: (r) => (
        <div className="flex flex-col">
          <span className="text-neutral-300">{r.offerer_username || "—"}</span>
          <MonoAddress value={r.offerer_wallet} />
        </div>
      ),
    },
    {
      key: "price",
      label: "Price",
      align: "right",
      render: (r) =>
        r.price != null
          ? `${Number(r.price).toFixed(4)} ${r.currency || "ETH"}`
          : "—",
    },
    { key: "quantity", label: "Qty", align: "right" },
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
      key: "created_at",
      label: "Created",
      render: (r) => (
        <span className="text-neutral-500 text-[11px]">
          {r.created_at ? new Date(r.created_at).toLocaleString() : "—"}
        </span>
      ),
    },
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
  ];

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

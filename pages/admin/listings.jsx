import { useState } from "react";
import useSWR from "swr";
import AdminLayout from "@/components/admin-layout";
import { MonoAddress } from "@/components/data-table";
import { ListShell, TextFilter, SelectFilter } from "@/components/list-shell";
import api, { fetcher } from "@/lib/api";

export default function Listings() {
  const [page, setPage] = useState(1);
  const [activeOnly, setActiveOnly] = useState("true");
  const [collectionAddress, setCollectionAddress] = useState("");
  const [seller, setSeller] = useState("");

  const params = new URLSearchParams({ page: String(page), pageSize: "50" });
  params.set("activeOnly", activeOnly);
  if (collectionAddress.trim()) params.set("collectionAddress", collectionAddress.trim());
  if (seller.trim()) params.set("seller", seller.trim());

  const { data, error, isLoading, mutate } = useSWR(
    `/admin/listings?${params.toString()}`,
    fetcher,
    { keepPreviousData: true }
  );

  const onCancel = async (id) => {
    if (
      !confirm(
        `Admin-cancel listing ${id}? This deletes the row and removes it from the NFT's listing array. Cannot be undone.`
      )
    )
      return;
    try {
      await api.post(`/admin/listings/${id}/cancel`);
      mutate();
    } catch (err) {
      alert(err?.response?.data?.error || "Cancel failed");
    }
  };

  const columns = [
    {
      key: "nft_image",
      label: "",
      width: 48,
      render: (r) =>
        r.nft_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={r.nft_image} alt="" className="w-9 h-9 object-cover bg-ink-700" />
        ) : (
          <div className="w-9 h-9 bg-ink-700" />
        ),
    },
    {
      key: "nft_name",
      label: "NFT",
      render: (r) => (
        <div className="flex flex-col">
          <span className="text-white">{r.nft_name || `#${r.token_id}`}</span>
          <span className="text-neutral-600 text-[11px]">
            <MonoAddress value={r.collection_address} /> · #{r.token_id}
          </span>
        </div>
      ),
    },
    {
      key: "seller",
      label: "Seller",
      render: (r) => (
        <div className="flex flex-col">
          <span className="text-neutral-300">{r.seller_username || "—"}</span>
          <MonoAddress value={r.seller_wallet} />
        </div>
      ),
    },
    {
      key: "price",
      label: "Price",
      align: "right",
      render: (r) => (r.price != null ? `${Number(r.price).toFixed(4)} ETH` : "—"),
    },
    { key: "quantity", label: "Qty", align: "right" },
    {
      key: "expiry_date",
      label: "Expires",
      render: (r) => (
        <span className="text-neutral-500 text-[11px]">
          {r.expiry_date ? new Date(r.expiry_date).toLocaleString() : "never"}
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
    <AdminLayout title="Listings">
      <ListShell
        filters={
          <>
            <SelectFilter
              label="Active only"
              value={activeOnly}
              onChange={(v) => {
                setActiveOnly(v);
                setPage(1);
              }}
              options={[
                { value: "true", label: "Active" },
                { value: "false", label: "Include expired" },
              ]}
            />
            <TextFilter
              label="Collection address"
              value={collectionAddress}
              onChange={(v) => {
                setCollectionAddress(v);
                setPage(1);
              }}
              placeholder="0x…"
            />
            <TextFilter
              label="Seller wallet"
              value={seller}
              onChange={(v) => {
                setSeller(v);
                setPage(1);
              }}
              placeholder="0x…"
            />
          </>
        }
        columns={columns}
        rows={data?.listings}
        total={data?.total}
        page={page}
        onPageChange={setPage}
        isLoading={isLoading}
        error={error}
      />
    </AdminLayout>
  );
}

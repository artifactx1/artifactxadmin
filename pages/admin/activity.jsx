import { useState } from "react";
import useSWR from "swr";
import AdminLayout from "@/components/admin-layout";
import { MonoAddress } from "@/components/data-table";
import { ListShell, TextFilter, SelectFilter, TRI_OPTIONS } from "@/components/list-shell";
import { fetcher } from "@/lib/api";

const EVENT_TYPES = [
  { value: "", label: "Any" },
  { value: "mint", label: "Mint" },
  { value: "sale", label: "Sale" },
  { value: "offer", label: "Offer" },
  { value: "offer_accepted", label: "Offer accepted" },
  { value: "listing", label: "Listing" },
  { value: "listing_cancelled", label: "Listing cancelled" },
  { value: "transfer", label: "Transfer" },
  { value: "drop", label: "Drop" },
];

export default function Activity() {
  const [page, setPage] = useState(1);
  const [eventType, setEventType] = useState("");
  const [collectionAddress, setCollectionAddress] = useState("");
  const [hasPrice, setHasPrice] = useState("all");

  const params = new URLSearchParams({ page: String(page), pageSize: "50" });
  if (eventType) params.set("eventType", eventType);
  if (collectionAddress.trim()) params.set("collectionAddress", collectionAddress.trim());
  if (hasPrice !== "all") params.set("hasPrice", hasPrice);

  const { data, error, isLoading } = useSWR(
    `/admin/activity?${params.toString()}`,
    fetcher,
    { keepPreviousData: true }
  );

  // Inline diagnostic: only triggered when collectionAddress is set.
  const { data: diag } = useSWR(
    collectionAddress.trim()
      ? `/admin/activity/diagnose-volume?address=${encodeURIComponent(collectionAddress.trim())}`
      : null,
    fetcher
  );

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
    { key: "event_type", label: "Type" },
    {
      key: "collection_address",
      label: "Collection",
      render: (r) => (
        <div className="flex flex-col">
          <span className="text-neutral-300">{r.nft_name || "—"}</span>
          <MonoAddress value={r.collection_address} />
        </div>
      ),
    },
    { key: "token_id", label: "Token" },
    {
      key: "price",
      label: "Price",
      align: "right",
      render: (r) =>
        r.price != null ? `${Number(r.price).toFixed(4)} ${r.currency || ""}` : "—",
    },
    { key: "quantity", label: "Qty", align: "right" },
    {
      key: "from_wallet",
      label: "From",
      render: (r) => <MonoAddress value={r.from_wallet} />,
    },
    {
      key: "to_wallet",
      label: "To",
      render: (r) => <MonoAddress value={r.to_wallet} />,
    },
  ];

  return (
    <AdminLayout title="Activity & Volume">
      {diag && (
        <div className="mb-4 bg-ink-900 border border-white/[0.06] p-5">
          <h2 className="text-[11px] uppercase tracking-[0.22em] text-neutral-500 mb-3">
            Volume diagnostic for {collectionAddress}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[12px]">
            <Stat label="Mint rows" value={diag.mint_rows} />
            <Stat label="Sale rows" value={diag.sale_rows} />
            <Stat label="Offer-accepted rows" value={diag.offer_rows} />
            <Stat label="Transfer rows" value={diag.transfer_rows} />
            <Stat label="Priced (counted)" value={diag.priced_volume_rows} />
            <Stat label="Unpriced (skipped)" value={diag.unpriced_volume_rows} status={diag.unpriced_volume_rows > 0 ? "warn" : null} />
            <Stat label="24h volume" value={Number(diag.volume_24h).toFixed(4)} />
            <Stat label="Total volume" value={Number(diag.volume_total).toFixed(4)} />
          </div>
          {diag.findings?.length > 0 && (
            <div className="mt-3 flex flex-col gap-2">
              {diag.findings.map((f, i) => (
                <div
                  key={i}
                  className={`px-3 py-2 text-[12px] border ${
                    f.level === "warn"
                      ? "border-yellow-900/40 bg-yellow-950/20 text-yellow-200"
                      : "border-blue-900/40 bg-blue-950/20 text-blue-200"
                  }`}
                >
                  {f.message}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <ListShell
        filters={
          <>
            <SelectFilter
              label="Event type"
              value={eventType}
              onChange={(v) => {
                setEventType(v);
                setPage(1);
              }}
              options={EVENT_TYPES}
            />
            <TextFilter
              label="Collection address"
              value={collectionAddress}
              onChange={(v) => {
                setCollectionAddress(v);
                setPage(1);
              }}
              placeholder="0x… (also enables volume diagnostic)"
              width={360}
            />
            <SelectFilter
              label="Has price"
              value={hasPrice}
              onChange={(v) => {
                setHasPrice(v);
                setPage(1);
              }}
              options={TRI_OPTIONS}
            />
          </>
        }
        columns={columns}
        rows={data?.activities}
        total={data?.total}
        page={page}
        onPageChange={setPage}
        isLoading={isLoading}
        error={error}
      />
    </AdminLayout>
  );
}

const Stat = ({ label, value, status }) => (
  <div
    className={`flex flex-col gap-1 px-3 py-2 border ${
      status === "warn" ? "border-yellow-900/40" : "border-white/[0.06]"
    }`}
  >
    <span className="text-[10px] uppercase tracking-[0.18em] text-neutral-600">
      {label}
    </span>
    <span className="text-base font-semibold text-white tabular-nums">
      {value ?? "—"}
    </span>
  </div>
);

import { useState } from "react";
import useSWR from "swr";
import AdminLayout from "@/components/admin-layout";
import { MonoAddress } from "@/components/data-table";
import { ListShell, TextFilter, SelectFilter, TRI_OPTIONS } from "@/components/list-shell";
import { fetcher } from "@/lib/api";

export default function NftsList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [collectionAddress, setCollectionAddress] = useState("");
  const [type, setType] = useState("all");
  const [hasListing, setHasListing] = useState("all");
  const [hasOffer, setHasOffer] = useState("all");

  const params = new URLSearchParams({ page: String(page), pageSize: "50" });
  if (search.trim()) params.set("search", search.trim());
  if (collectionAddress.trim()) params.set("collectionAddress", collectionAddress.trim());
  if (type !== "all") params.set("type", type);
  if (hasListing === "true") params.set("hasListing", "true");
  if (hasOffer === "true") params.set("hasOffer", "true");

  const { data, error, isLoading } = useSWR(
    `/admin/nfts?${params.toString()}`,
    fetcher,
    { keepPreviousData: true }
  );

  const columns = [
    {
      key: "image",
      label: "",
      width: 48,
      render: (r) =>
        r.thumbnail || r.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={r.thumbnail || r.image} alt="" className="w-9 h-9 object-cover bg-ink-700" />
        ) : (
          <div className="w-9 h-9 bg-ink-700" />
        ),
    },
    {
      key: "name",
      label: "Name",
      render: (r) => (
        <div className="flex flex-col">
          <span className="text-white">{r.name || `#${r.collection_id}`}</span>
          <span className="text-neutral-600 text-[11px]">
            <MonoAddress value={r.collection_address} /> · #{r.collection_id}
          </span>
        </div>
      ),
    },
    { key: "type", label: "Type" },
    { key: "supply", label: "Supply", align: "right" },
    { key: "network_name", label: "Network" },
    { key: "listing_count", label: "Listings", align: "right" },
    { key: "offer_count", label: "Offers", align: "right" },
  ];

  return (
    <AdminLayout title="NFTs">
      <ListShell
        filters={
          <>
            <TextFilter
              label="Search name / token id"
              value={search}
              onChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
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
            <SelectFilter
              label="Type"
              value={type}
              onChange={(v) => {
                setType(v);
                setPage(1);
              }}
              options={[
                { value: "all", label: "Any" },
                { value: "ERC721", label: "ERC721" },
                { value: "ERC1155", label: "ERC1155" },
              ]}
            />
            <SelectFilter
              label="Has listing"
              value={hasListing}
              onChange={(v) => {
                setHasListing(v);
                setPage(1);
              }}
              options={TRI_OPTIONS}
            />
            <SelectFilter
              label="Has offer"
              value={hasOffer}
              onChange={(v) => {
                setHasOffer(v);
                setPage(1);
              }}
              options={TRI_OPTIONS}
            />
          </>
        }
        columns={columns}
        rows={data?.nfts}
        total={data?.total}
        page={page}
        onPageChange={setPage}
        isLoading={isLoading}
        error={error}
        onRowClick={(r) => {
          window.location.href = `/admin/nfts/${r.collection_address}/${r.collection_id}`;
        }}
      />
    </AdminLayout>
  );
}

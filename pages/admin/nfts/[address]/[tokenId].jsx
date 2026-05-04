import { useState } from "react";
import { useRouter } from "next/router";
import useSWR from "swr";
import AdminLayout from "@/components/admin-layout";
import api, { fetcher } from "@/lib/api";

export default function NftDetail() {
  const router = useRouter();
  const { address, tokenId } = router.query;
  const [refreshing, setRefreshing] = useState(false);

  const { data, error, mutate, isLoading } = useSWR(
    address && tokenId ? `/admin/nfts/${address}/${tokenId}` : null,
    fetcher
  );
  const nft = data?.nft;

  // Alchemy raw inspector — only loaded when the user clicks the toggle.
  const [showAlchemy, setShowAlchemy] = useState(false);
  const network = nft?.network_name;
  const { data: rawData, isLoading: rawLoading } = useSWR(
    showAlchemy && network && address && tokenId
      ? `/admin/nfts/${network}/${address}/${tokenId}/alchemy-raw`
      : null,
    fetcher
  );

  const onRefresh = async () => {
    if (!network) return alert("Missing network");
    setRefreshing(true);
    try {
      await api.get(`/refreshMetadata/${network}/${address}/${tokenId}`);
      mutate();
    } catch (err) {
      alert(err?.response?.data?.error || "Refresh failed");
    } finally {
      setRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="NFT">
        <div className="text-sm text-neutral-600">Loading…</div>
      </AdminLayout>
    );
  }
  if (error || !nft) {
    return (
      <AdminLayout title="NFT">
        <div className="text-sm text-red-400">
          {error?.response?.data?.error || "NFT not found"}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={nft.name || `#${nft.collection_id}`}>
      <div className="flex flex-col gap-6">
        {/* Image variants side-by-side so blurry-image bugs are obvious */}
        <div className="bg-ink-900 border border-white/[0.06] p-5">
          <h2 className="text-[11px] uppercase tracking-[0.22em] text-neutral-500 mb-3">
            Stored image variants
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <ImageCard label="image (full-res)" url={nft.image} />
            <ImageCard label="preview" url={nft.preview} />
            <ImageCard label="thumbnail" url={nft.thumbnail} />
          </div>
        </div>

        <div className="bg-ink-900 border border-white/[0.06] p-5 grid grid-cols-2 md:grid-cols-3 gap-4">
          <Field label="Token ID">{nft.collection_id}</Field>
          <Field label="Type">{nft.type}</Field>
          <Field label="Supply">{nft.supply}</Field>
          <Field label="Network">{nft.network_name}</Field>
          <Field label="Mime">{nft.mime_type || "—"}</Field>
          <Field label="Created">
            {nft.created_at ? new Date(nft.created_at).toLocaleString() : "—"}
          </Field>
          <Field label="Owner wallet">
            {Array.isArray(nft.owner_wallet) ? nft.owner_wallet.join(", ") : "—"}
          </Field>
        </div>

        <div className="bg-ink-900 border border-white/[0.06] p-5 flex flex-col gap-3">
          <h2 className="text-[11px] uppercase tracking-[0.22em] text-neutral-500">
            Actions
          </h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="px-3 py-1.5 text-[12px] border border-white/[0.06] hover:bg-white/[0.04] disabled:opacity-50 cursor-pointer"
            >
              {refreshing ? "Refreshing metadata…" : "Refresh metadata (Alchemy)"}
            </button>
            <button
              onClick={() => setShowAlchemy(!showAlchemy)}
              className="px-3 py-1.5 text-[12px] border border-white/[0.06] hover:bg-white/[0.04] cursor-pointer"
            >
              {showAlchemy ? "Hide" : "Show"} raw Alchemy response
            </button>
            <button
              onClick={async () => {
                if (
                  !nft.is_hidden &&
                  !confirm(
                    "Soft-hide this NFT? It'll be excluded from public surfaces. You can restore from Takedowns."
                  )
                )
                  return;
                try {
                  await api.patch(`/admin/nfts/${address}/${tokenId}/flags`, {
                    is_hidden: !nft.is_hidden,
                  });
                  mutate();
                } catch (err) {
                  alert(err?.response?.data?.error || "Failed");
                }
              }}
              className={`px-3 py-1.5 text-[12px] border cursor-pointer ${
                nft.is_hidden
                  ? "border-red-900/60 bg-red-900/40 text-red-200"
                  : "border-white/[0.06] hover:bg-white/[0.04]"
              }`}
            >
              {nft.is_hidden ? "Hidden — click to unhide" : "Hide NFT"}
            </button>
          </div>
        </div>

        {showAlchemy && (
          <div className="bg-ink-900 border border-white/[0.06] p-5 flex flex-col gap-3">
            <h2 className="text-[11px] uppercase tracking-[0.22em] text-neutral-500">
              Alchemy image candidates
            </h2>
            {rawLoading && <div className="text-sm text-neutral-600">Loading…</div>}
            {rawData && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(rawData.imageCandidates || {}).map(([key, url]) => (
                    <ImageCard key={key} label={key} url={url} />
                  ))}
                </div>
                <details className="border-t border-white/[0.06] pt-3">
                  <summary className="cursor-pointer text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                    Full raw JSON
                  </summary>
                  <pre className="mt-2 text-[11px] text-neutral-400 overflow-x-auto max-h-[400px]">
                    {JSON.stringify(rawData.raw, null, 2)}
                  </pre>
                </details>
              </>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

const Field = ({ label, children }) => (
  <div className="flex flex-col gap-1">
    <span className="text-[10px] uppercase tracking-[0.18em] text-neutral-600">
      {label}
    </span>
    <span className="text-[13px] text-neutral-200">{children ?? "—"}</span>
  </div>
);

const ImageCard = ({ label, url }) => (
  <div className="flex flex-col gap-1">
    <span className="text-[10px] uppercase tracking-[0.18em] text-neutral-600 truncate">
      {label}
    </span>
    {url ? (
      <a href={url} target="_blank" rel="noreferrer" className="block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={label}
          className="w-full aspect-square object-cover bg-ink-700 hover:opacity-80 transition-opacity"
        />
      </a>
    ) : (
      <div className="w-full aspect-square bg-ink-700 flex items-center justify-center text-[10px] text-neutral-700 uppercase tracking-widest">
        none
      </div>
    )}
    <code className="text-[10px] text-neutral-700 truncate" title={url}>
      {url || "—"}
    </code>
  </div>
);

import useSWR from "swr";
import Link from "next/link";
import AdminLayout from "@/components/admin-layout";
import { MonoAddress } from "@/components/data-table";
import api, { fetcher } from "@/lib/api";

export default function Takedowns() {
  const { data, error, isLoading, mutate } = useSWR("/admin/takedowns", fetcher);

  const restoreCollection = async (address) => {
    if (!confirm(`Restore ${address}? Sets is_deactivated = false.`)) return;
    try {
      await api.patch(`/admin/collections/${address}/flags`, {
        is_deactivated: false,
      });
      mutate();
    } catch (err) {
      alert(err?.response?.data?.error || "Restore failed");
    }
  };

  return (
    <AdminLayout title="Takedowns">
      <div className="flex flex-col gap-6">
        <Section title="Deactivated collections" rows={data?.collections}>
          {(c) => (
            <tr key={c.id} className="border-t border-white/[0.04]">
              <td className="px-3 py-2">
                {c.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.image} alt="" className="w-9 h-9 object-cover bg-ink-700" />
                ) : (
                  <div className="w-9 h-9 bg-ink-700" />
                )}
              </td>
              <td className="px-3 py-2">
                <Link
                  href={`/admin/collections/${c.address}`}
                  className="text-white hover:underline"
                >
                  {c.name}
                </Link>
                <div>
                  <MonoAddress value={c.address} />
                </div>
              </td>
              <td className="px-3 py-2 text-neutral-400">{c.network}</td>
              <td className="px-3 py-2 text-neutral-500 text-[11px]">
                {c.created_at ? new Date(c.created_at).toLocaleDateString() : "—"}
              </td>
              <td className="px-3 py-2 text-right">
                <button
                  onClick={() => restoreCollection(c.address)}
                  className="px-2 py-0.5 text-[11px] border border-emerald-900/60 text-emerald-300 hover:bg-emerald-900/20 cursor-pointer"
                >
                  Restore
                </button>
              </td>
            </tr>
          )}
        </Section>

        <Section title="Hidden NFTs" rows={data?.nfts}>
          {(n) => (
            <tr key={n.id} className="border-t border-white/[0.04]">
              <td className="px-3 py-2">
                {n.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={n.image} alt="" className="w-9 h-9 object-cover bg-ink-700" />
                ) : (
                  <div className="w-9 h-9 bg-ink-700" />
                )}
              </td>
              <td className="px-3 py-2">
                <Link
                  href={`/admin/nfts/${n.collection_address}/${n.collection_id}`}
                  className="text-white hover:underline"
                >
                  {n.name || `#${n.collection_id}`}
                </Link>
                <div>
                  <MonoAddress value={n.collection_address} /> · #{n.collection_id}
                </div>
              </td>
              <td className="px-3 py-2 text-neutral-500 text-[11px]" colSpan={3}>
                {n.created_at ? new Date(n.created_at).toLocaleDateString() : "—"}
              </td>
            </tr>
          )}
        </Section>

        {error && (
          <div className="text-xs text-red-400">
            {error?.response?.data?.error || error.message}
          </div>
        )}
        {isLoading && <div className="text-xs text-neutral-600">Loading…</div>}
      </div>
    </AdminLayout>
  );
}

const Section = ({ title, rows, children }) => (
  <div className="bg-ink-900 border border-white/[0.06]">
    <div className="px-3 py-2 border-b border-white/[0.06]">
      <h2 className="text-[11px] uppercase tracking-[0.22em] text-neutral-500">
        {title}{" "}
        <span className="text-neutral-700">({rows?.length ?? 0})</span>
      </h2>
    </div>
    <table className="w-full text-[13px]">
      <tbody>
        {(rows || []).map((r) => children(r))}
        {(!rows || rows.length === 0) && (
          <tr>
            <td colSpan={5} className="px-3 py-6 text-center text-neutral-600">
              None
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

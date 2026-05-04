import { useState } from "react";
import useSWR from "swr";
import AdminLayout from "@/components/admin-layout";
import api, { fetcher } from "@/lib/api";

export default function IndexerState() {
  const { data, error, mutate, isLoading } = useSWR(
    "/admin/indexer/state",
    fetcher,
    { refreshInterval: 15_000 }
  );
  const [replayChain, setReplayChain] = useState("");
  const [replayBlock, setReplayBlock] = useState("");
  const [replaying, setReplaying] = useState(false);

  const onReplay = async () => {
    if (!replayChain || !replayBlock) return;
    if (
      !confirm(
        `Rewind ${replayChain} indexer to block ${replayBlock}? The poller will re-emit transfers from that block on its next cycle.`
      )
    )
      return;
    setReplaying(true);
    try {
      await api.post("/admin/indexer/replay", {
        chain: replayChain,
        fromBlock: replayBlock,
      });
      setReplayChain("");
      setReplayBlock("");
      mutate();
    } catch (err) {
      alert(err?.response?.data?.error || "Replay failed");
    } finally {
      setReplaying(false);
    }
  };

  return (
    <AdminLayout title="Indexer state">
      <div className="flex flex-col gap-6">
        <div className="bg-ink-900 border border-white/[0.06]">
          <table className="w-full text-[13px]">
            <thead className="bg-ink-800">
              <tr>
                <th className="px-3 py-2 text-left text-[10px] uppercase tracking-[0.18em] text-neutral-500">
                  Chain
                </th>
                <th className="px-3 py-2 text-left text-[10px] uppercase tracking-[0.18em] text-neutral-500">
                  Last block
                </th>
                <th className="px-3 py-2 text-left text-[10px] uppercase tracking-[0.18em] text-neutral-500">
                  Updated at
                </th>
                <th className="px-3 py-2 text-right text-[10px] uppercase tracking-[0.18em] text-neutral-500">
                  Lag
                </th>
              </tr>
            </thead>
            <tbody>
              {(data?.chains || []).map((c) => {
                const lag = c.lag_seconds ?? 0;
                const tone =
                  lag > 600
                    ? "text-red-300"
                    : lag > 300
                    ? "text-yellow-300"
                    : "text-emerald-300";
                return (
                  <tr key={c.chain} className="border-t border-white/[0.04]">
                    <td className="px-3 py-2 font-medium text-white">{c.chain}</td>
                    <td className="px-3 py-2 font-mono text-[11px] text-neutral-400">
                      {c.last_block}
                    </td>
                    <td className="px-3 py-2 text-neutral-500 text-[11px]">
                      {c.updated_at
                        ? new Date(c.updated_at).toLocaleString()
                        : "—"}
                    </td>
                    <td className={`px-3 py-2 text-right font-mono ${tone}`}>
                      {lag != null ? `${lag}s` : "—"}
                    </td>
                  </tr>
                );
              })}
              {!data?.chains?.length && !isLoading && (
                <tr>
                  <td className="px-3 py-6 text-center text-neutral-600 text-sm" colSpan={4}>
                    No indexer state rows
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-ink-900 border border-white/[0.06] p-5 flex flex-col gap-3">
          <h2 className="text-[11px] uppercase tracking-[0.22em] text-neutral-500">
            Replay from block
          </h2>
          <p className="text-[12px] text-neutral-500 max-w-2xl">
            Rewinds last_block for the chosen chain. The running indexer picks
            up on its next poll cycle and re-emits transfers from that block.
            Inserts dedupe by tx_hash, so this is idempotent.
          </p>
          <div className="flex flex-wrap gap-3 items-end">
            <label className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-[0.18em] text-neutral-600">
                Chain
              </span>
              <select
                value={replayChain}
                onChange={(e) => setReplayChain(e.target.value)}
                className="bg-ink-800 border border-white/[0.06] px-2 py-1.5 text-[13px] focus:outline-none focus:border-white/30"
              >
                <option value="">Select…</option>
                {(data?.chains || []).map((c) => (
                  <option key={c.chain} value={c.chain} className="bg-ink-800">
                    {c.chain}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-[0.18em] text-neutral-600">
                From block (decimal or 0x…)
              </span>
              <input
                value={replayBlock}
                onChange={(e) => setReplayBlock(e.target.value)}
                placeholder="e.g. 12345678 or 0xBC614E"
                className="bg-ink-800 border border-white/[0.06] px-3 py-1.5 text-[13px] focus:outline-none focus:border-white/30 min-w-[260px]"
              />
            </label>
            <button
              onClick={onReplay}
              disabled={!replayChain || !replayBlock || replaying}
              className="px-3 py-1.5 text-[12px] border border-white/[0.06] hover:bg-white/[0.04] disabled:opacity-40 cursor-pointer"
            >
              {replaying ? "Replaying…" : "Replay"}
            </button>
          </div>
        </div>

        {error && (
          <div className="text-xs text-red-400">
            {error?.response?.data?.error || error.message}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

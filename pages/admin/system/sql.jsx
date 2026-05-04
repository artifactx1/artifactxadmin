import { useState } from "react";
import AdminLayout from "@/components/admin-layout";
import api from "@/lib/api";

export default function SqlConsole() {
  const [sql, setSql] = useState("SELECT name, network, type, created_at\n  FROM collections\n ORDER BY created_at DESC\n LIMIT 25;");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const onRun = async (e) => {
    e?.preventDefault?.();
    setRunning(true);
    setError(null);
    try {
      const { data } = await api.post("/admin/sql/execute", { sql });
      setResult(data);
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
      setResult(null);
    } finally {
      setRunning(false);
    }
  };

  const onKeyDown = (e) => {
    // Cmd/Ctrl+Enter runs the query.
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") onRun();
  };

  return (
    <AdminLayout title="SQL console">
      <div className="flex flex-col gap-4">
        <div className="bg-yellow-950/20 border border-yellow-900/40 px-3 py-2 text-[12px] text-yellow-200">
          Read-only. Single statement at a time. 5s timeout, 500-row cap. Every
          query is audit-logged.
        </div>

        <form onSubmit={onRun} className="flex flex-col gap-2">
          <textarea
            value={sql}
            onChange={(e) => setSql(e.target.value)}
            onKeyDown={onKeyDown}
            rows={10}
            spellCheck={false}
            className="bg-ink-800 border border-white/[0.06] px-3 py-2 text-[13px] font-mono focus:outline-none focus:border-white/30"
          />
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={running}
              className="bg-white text-black text-sm font-semibold px-4 py-2 hover:bg-neutral-200 disabled:opacity-50 cursor-pointer"
            >
              {running ? "Running…" : "Run (⌘+Enter)"}
            </button>
            {result && (
              <span className="text-[12px] text-neutral-500">
                {result.rowCount} row{result.rowCount === 1 ? "" : "s"} ·{" "}
                {result.elapsedMs}ms
                {result.truncated && " · truncated"}
              </span>
            )}
          </div>
        </form>

        {error && (
          <div className="border border-red-900/40 bg-red-950/20 px-3 py-2 text-[12px] text-red-200 font-mono">
            {error}
          </div>
        )}

        {result && result.rows && result.rows.length > 0 && (
          <div className="bg-ink-900 border border-white/[0.06] overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead className="bg-ink-800">
                <tr>
                  {Object.keys(result.rows[0]).map((k) => (
                    <th
                      key={k}
                      className="px-3 py-2 text-left font-semibold text-[10px] uppercase tracking-[0.18em] text-neutral-500"
                    >
                      {k}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row, idx) => (
                  <tr key={idx} className="border-t border-white/[0.04]">
                    {Object.keys(result.rows[0]).map((k) => {
                      const v = row[k];
                      const display =
                        v == null
                          ? <span className="text-neutral-700">null</span>
                          : typeof v === "object"
                          ? JSON.stringify(v)
                          : String(v);
                      return (
                        <td
                          key={k}
                          className="px-3 py-2 text-neutral-300 font-mono align-top"
                        >
                          {typeof display === "string" && display.length > 200
                            ? display.slice(0, 200) + "…"
                            : display}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {result && result.rows && result.rows.length === 0 && (
          <div className="text-[12px] text-neutral-500">
            Query returned 0 rows.
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

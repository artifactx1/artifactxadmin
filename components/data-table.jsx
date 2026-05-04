// Lightweight table primitive used across module list views. Keeps every
// list looking the same without pulling in a heavy table lib.
export function DataTable({ columns, rows, onRowClick, emptyMessage = "No results" }) {
  if (!rows || rows.length === 0) {
    return (
      <div className="border border-white/[0.06] bg-ink-900 p-10 text-center text-sm text-neutral-600">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="border border-white/[0.06] bg-ink-900 overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead className="bg-ink-800">
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                className={`px-3 py-2 text-left font-semibold text-[10px] uppercase tracking-[0.18em] text-neutral-500 ${
                  c.align === "right" ? "text-right" : ""
                }`}
                style={c.width ? { width: c.width } : undefined}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr
              key={row.id || row.address || idx}
              onClick={() => onRowClick?.(row)}
              className={`border-t border-white/[0.04] ${
                onRowClick ? "cursor-pointer hover:bg-white/[0.02]" : ""
              }`}
            >
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={`px-3 py-2 text-neutral-200 align-middle ${
                    c.align === "right" ? "text-right tabular-nums" : ""
                  } ${c.mono ? "font-mono text-[12px]" : ""}`}
                >
                  {c.render ? c.render(row) : row[c.key] ?? "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function StatusPill({ active, label, activeClass = "bg-emerald-900/40 text-emerald-300" }) {
  return (
    <span
      className={`inline-block px-1.5 py-0.5 text-[10px] uppercase tracking-[0.14em] ${
        active ? activeClass : "bg-white/[0.04] text-neutral-600"
      }`}
    >
      {label || (active ? "yes" : "no")}
    </span>
  );
}

export function MonoAddress({ value }) {
  if (!value) return <span className="text-neutral-700">—</span>;
  const v = String(value);
  return (
    <code className="font-mono text-[11px] text-neutral-500" title={v}>
      {v.length > 14 ? `${v.slice(0, 6)}…${v.slice(-4)}` : v}
    </code>
  );
}

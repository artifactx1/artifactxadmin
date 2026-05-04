// Lightweight table primitive used across module list views. Keeps every
// list looking the same without pulling in a heavy table lib.
//
// `selection`/`onSelectionChange` opt the table into multi-select with a
// header checkbox + per-row checkboxes. Caller controls the Set of selected
// row keys (uses `selectionKey(row)` to derive the key — defaults to row.id).
export function DataTable({
  columns,
  rows,
  onRowClick,
  emptyMessage = "No results",
  selection,
  onSelectionChange,
  selectionKey = (r) => r.id,
}) {
  if (!rows || rows.length === 0) {
    return (
      <div className="border border-white/[0.06] bg-ink-900 p-10 text-center text-sm text-neutral-600">
        {emptyMessage}
      </div>
    );
  }

  const selectable = !!onSelectionChange;
  const allSelected =
    selectable &&
    rows.length > 0 &&
    rows.every((r) => selection?.has(selectionKey(r)));

  const toggleAll = () => {
    if (!selectable) return;
    const next = new Set(selection || []);
    if (allSelected) {
      rows.forEach((r) => next.delete(selectionKey(r)));
    } else {
      rows.forEach((r) => next.add(selectionKey(r)));
    }
    onSelectionChange(next);
  };

  const toggleOne = (row) => {
    const key = selectionKey(row);
    const next = new Set(selection || []);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onSelectionChange(next);
  };

  return (
    <div className="border border-white/[0.06] bg-ink-900 overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead className="bg-ink-800">
          <tr>
            {selectable && (
              <th className="px-3 py-2 w-8">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="cursor-pointer"
                />
              </th>
            )}
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
          {rows.map((row, idx) => {
            const key = selectionKey(row);
            const isSelected = selection?.has(key);
            return (
              <tr
                key={key || row.address || idx}
                onClick={() => onRowClick?.(row)}
                className={`border-t border-white/[0.04] ${
                  onRowClick ? "cursor-pointer hover:bg-white/[0.02]" : ""
                } ${isSelected ? "bg-white/[0.04]" : ""}`}
              >
                {selectable && (
                  <td
                    className="px-3 py-2 align-middle"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleOne(row);
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={!!isSelected}
                      onChange={() => {}}
                      className="cursor-pointer"
                    />
                  </td>
                )}
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
            );
          })}
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

// Action bar that floats below the filter strip when at least one row is
// selected. Caller passes the actions array.
export function BulkActionBar({ count, actions, onClear }) {
  if (!count) return null;
  return (
    <div className="bg-ink-800 border border-white/[0.06] px-4 py-2 flex items-center gap-3 sticky top-12 z-20">
      <span className="text-[12px] text-neutral-300">
        <strong className="text-white">{count}</strong> selected
      </span>
      <div className="flex-1" />
      {actions.map((a) => (
        <button
          key={a.label}
          onClick={a.onClick}
          className={`px-3 py-1.5 text-[12px] border cursor-pointer ${
            a.danger
              ? "border-red-900/60 text-red-300 hover:bg-red-900/20"
              : "border-white/[0.06] hover:bg-white/[0.04]"
          }`}
        >
          {a.label}
        </button>
      ))}
      <button
        onClick={onClear}
        className="text-neutral-500 hover:text-white text-[12px] cursor-pointer"
      >
        Clear
      </button>
    </div>
  );
}

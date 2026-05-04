import { DataTable } from "./data-table";

// Reusable list-page shell. Filter strip, table, footer pagination.
// Module pages compose this so they don't re-implement the same chrome.
export function ListShell({
  filters,
  columns,
  rows,
  total,
  page,
  pageSize = 50,
  onPageChange,
  isLoading,
  error,
  onRowClick,
  emptyMessage,
  extraTopRight,
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3 items-end justify-between">
        <div className="flex flex-wrap gap-3 items-end">{filters}</div>
        {extraTopRight}
      </div>

      <DataTable
        columns={columns}
        rows={rows || []}
        emptyMessage={isLoading ? "Loading…" : emptyMessage || "No results"}
        onRowClick={onRowClick}
      />

      <div className="flex items-center justify-between text-[12px] text-neutral-500">
        <span>
          {total != null
            ? `Page ${page} — showing ${rows?.length ?? 0} of ${total}`
            : "—"}
        </span>
        <div className="flex gap-2">
          <button
            disabled={page <= 1}
            onClick={() => onPageChange(Math.max(1, page - 1))}
            className="px-3 py-1 border border-white/[0.06] hover:bg-white/[0.04] disabled:opacity-40 cursor-pointer"
          >
            Prev
          </button>
          <button
            disabled={total == null || page * pageSize >= total}
            onClick={() => onPageChange(page + 1)}
            className="px-3 py-1 border border-white/[0.06] hover:bg-white/[0.04] disabled:opacity-40 cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>

      {error && (
        <div className="text-xs text-red-400">
          Failed to load: {error?.response?.data?.error || error.message}
        </div>
      )}
    </div>
  );
}

export const TextFilter = ({ label, value, onChange, placeholder, width = 260 }) => (
  <label className="flex flex-col gap-1" style={{ minWidth: width }}>
    <span className="text-[10px] uppercase tracking-[0.18em] text-neutral-600">
      {label}
    </span>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="bg-ink-800 border border-white/[0.06] px-3 py-1.5 text-[13px] focus:outline-none focus:border-white/30"
    />
  </label>
);

export const SelectFilter = ({ label, value, onChange, options }) => (
  <label className="flex flex-col gap-1">
    <span className="text-[10px] uppercase tracking-[0.18em] text-neutral-600">
      {label}
    </span>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-ink-800 border border-white/[0.06] px-2 py-1.5 text-[13px] focus:outline-none focus:border-white/30"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value} className="bg-ink-800">
          {o.label}
        </option>
      ))}
    </select>
  </label>
);

export const TRI_OPTIONS = [
  { value: "all", label: "Any" },
  { value: "true", label: "Yes" },
  { value: "false", label: "No" },
];

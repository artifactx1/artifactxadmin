import { useState } from "react";
import useSWR from "swr";
import AdminLayout from "@/components/admin-layout";
import { ListShell, SelectFilter } from "@/components/list-shell";
import api, { fetcher } from "@/lib/api";

const STATUS_OPTIONS = [
  { value: "", label: "Any status" },
  { value: "pending", label: "Pending" },
  { value: "running", label: "Running" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
  { value: "cancelled", label: "Cancelled" },
];

const STATUS_TONES = {
  pending: "bg-yellow-900/40 text-yellow-300",
  running: "bg-blue-900/40 text-blue-300",
  completed: "bg-emerald-900/40 text-emerald-300",
  failed: "bg-red-900/40 text-red-300",
  cancelled: "bg-white/[0.04] text-neutral-500",
};

export default function Jobs() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [kind, setKind] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({ kind: "", paramsJson: "{}" });

  const params = new URLSearchParams({ page: String(page), pageSize: "50" });
  if (status) params.set("status", status);
  if (kind) params.set("kind", kind);

  const { data, error, isLoading, mutate } = useSWR(
    `/admin/jobs?${params.toString()}`,
    fetcher,
    { keepPreviousData: true, refreshInterval: 5_000 }
  );

  const onCreate = async (e) => {
    e.preventDefault();
    let parsed;
    try {
      parsed = JSON.parse(createForm.paramsJson || "{}");
    } catch {
      return alert("Invalid JSON in params");
    }
    setCreating(true);
    try {
      await api.post("/admin/jobs", { kind: createForm.kind, params: parsed });
      setCreateForm({ kind: "", paramsJson: "{}" });
      mutate();
    } catch (err) {
      alert(err?.response?.data?.error || "Create failed");
    } finally {
      setCreating(false);
    }
  };

  const onCancel = async (id) => {
    if (!confirm(`Cancel job ${id}? Only pending jobs can be cancelled.`)) return;
    try {
      await api.post(`/admin/jobs/${id}/cancel`);
      mutate();
    } catch (err) {
      alert(err?.response?.data?.error || "Cancel failed");
    }
  };

  const onRetry = async (id) => {
    if (!confirm(`Re-enqueue job ${id} as a new pending row?`)) return;
    try {
      await api.post(`/admin/jobs/${id}/retry`);
      mutate();
    } catch (err) {
      alert(err?.response?.data?.error || "Retry failed");
    }
  };

  const columns = [
    {
      key: "status",
      label: "Status",
      render: (r) => (
        <span
          className={`inline-block px-1.5 py-0.5 text-[10px] uppercase tracking-[0.14em] ${
            STATUS_TONES[r.status] || "bg-white/[0.04] text-neutral-500"
          }`}
        >
          {r.status}
        </span>
      ),
    },
    { key: "kind", label: "Kind", mono: true },
    {
      key: "progress",
      label: "Progress / Result",
      render: (r) => (
        <span className="text-[12px] text-neutral-400">
          {r.status === "running"
            ? r.progress_message || "running…"
            : r.status === "failed"
            ? r.error_message
            : r.status === "completed"
            ? r.result
              ? JSON.stringify(r.result).slice(0, 60)
              : "ok"
            : "—"}
        </span>
      ),
    },
    { key: "initiated_by_username", label: "By" },
    {
      key: "created_at",
      label: "Created",
      render: (r) => (
        <span className="text-[11px] text-neutral-500">
          {new Date(r.created_at).toLocaleString()}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      render: (r) => (
        <div className="flex gap-2">
          {r.status === "pending" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCancel(r.id);
              }}
              className="px-2 py-0.5 text-[11px] border border-white/[0.06] hover:bg-white/[0.04] cursor-pointer"
            >
              Cancel
            </button>
          )}
          {r.status === "failed" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRetry(r.id);
              }}
              className="px-2 py-0.5 text-[11px] border border-emerald-900/60 text-emerald-300 hover:bg-emerald-900/20 cursor-pointer"
            >
              Retry
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <AdminLayout title="Background jobs">
      <ListShell
        filters={
          <>
            <SelectFilter
              label="Status"
              value={status}
              onChange={(v) => {
                setStatus(v);
                setPage(1);
              }}
              options={STATUS_OPTIONS}
            />
            <SelectFilter
              label="Kind"
              value={kind}
              onChange={(v) => {
                setKind(v);
                setPage(1);
              }}
              options={[
                { value: "", label: "Any" },
                ...(data?.validKinds || []).map((k) => ({ value: k, label: k })),
              ]}
            />
          </>
        }
        columns={columns}
        rows={data?.jobs}
        total={data?.total}
        page={page}
        onPageChange={setPage}
        isLoading={isLoading}
        error={error}
        onRowClick={(r) => setExpanded(expanded === r.id ? null : r.id)}
      />

      {expanded && data?.jobs && (
        <JobDrawer
          job={data.jobs.find((j) => j.id === expanded)}
          onClose={() => setExpanded(null)}
        />
      )}

      <details className="mt-6 bg-ink-900 border border-white/[0.06] p-5">
        <summary className="cursor-pointer text-[11px] uppercase tracking-[0.22em] text-neutral-500">
          Enqueue a job manually
        </summary>
        <form onSubmit={onCreate} className="mt-4 flex flex-col gap-3 max-w-2xl">
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-[0.18em] text-neutral-600">
              Kind
            </span>
            <select
              value={createForm.kind}
              onChange={(e) => setCreateForm((f) => ({ ...f, kind: e.target.value }))}
              required
              className="bg-ink-800 border border-white/[0.06] px-2 py-1.5 text-[13px] focus:outline-none focus:border-white/30"
            >
              <option value="">Select…</option>
              {(data?.validKinds || []).map((k) => (
                <option key={k} value={k} className="bg-ink-800">
                  {k}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-[0.18em] text-neutral-600">
              Params (JSON)
            </span>
            <textarea
              value={createForm.paramsJson}
              onChange={(e) =>
                setCreateForm((f) => ({ ...f, paramsJson: e.target.value }))
              }
              rows={6}
              className="bg-ink-800 border border-white/[0.06] px-3 py-2 text-[12px] font-mono focus:outline-none focus:border-white/30"
            />
          </label>
          <button
            type="submit"
            disabled={creating || !createForm.kind}
            className="self-start bg-white text-black text-sm font-semibold px-4 py-2 hover:bg-neutral-200 disabled:opacity-50 cursor-pointer"
          >
            {creating ? "Enqueuing…" : "Enqueue"}
          </button>
        </form>
      </details>
    </AdminLayout>
  );
}

const JobDrawer = ({ job, onClose }) => {
  if (!job) return null;
  return (
    <div className="mt-4 bg-ink-900 border border-white/[0.06] p-5 flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-semibold text-white font-mono">{job.kind}</h3>
          <p className="text-[12px] text-neutral-500">
            {job.id} · enqueued {new Date(job.created_at).toLocaleString()} by{" "}
            {job.initiated_by_username}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-neutral-500 hover:text-white text-[12px] cursor-pointer"
        >
          Close
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Pre title="Params" data={job.params} />
        {job.result && <Pre title="Result" data={job.result} />}
      </div>
      {job.error_message && (
        <div className="border border-red-900/40 bg-red-950/20 px-3 py-2 text-[12px] text-red-200">
          {job.error_message}
        </div>
      )}
      <div className="text-[11px] text-neutral-600 grid grid-cols-3 gap-3">
        <span>started: {job.started_at ? new Date(job.started_at).toLocaleString() : "—"}</span>
        <span>finished: {job.finished_at ? new Date(job.finished_at).toLocaleString() : "—"}</span>
        <span>progress: {job.progress_message || "—"}</span>
      </div>
    </div>
  );
};

const Pre = ({ title, data }) => (
  <div className="bg-ink-800 border border-white/[0.06] p-3">
    <span className="text-[10px] uppercase tracking-[0.18em] text-neutral-500">
      {title}
    </span>
    <pre className="mt-2 text-[11px] text-neutral-300 overflow-x-auto">
      {data ? JSON.stringify(data, null, 2) : "(none)"}
    </pre>
  </div>
);

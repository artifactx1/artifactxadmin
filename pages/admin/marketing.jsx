import { useEffect, useState } from "react";
import useSWR from "swr";
import AdminLayout from "@/components/admin-layout";
import api, { fetcher } from "@/lib/api";

export default function Marketing() {
  const { data, error, mutate, isLoading } = useSWR("/marketing", fetcher);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) {
      setText(JSON.stringify(data, null, 2));
    }
  }, [data]);

  const onSave = async (e) => {
    e.preventDefault();
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      return alert("Invalid JSON");
    }
    setSaving(true);
    try {
      await api.put("/marketing", parsed);
      mutate();
    } catch (err) {
      alert(err?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Marketing inputs">
      <form onSubmit={onSave} className="flex flex-col gap-3 max-w-3xl">
        <p className="text-[12px] text-neutral-500">
          Free-form JSON inputs for the marketing site. Save replaces the current document.
        </p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={20}
          className="bg-ink-800 border border-white/[0.06] px-3 py-2 text-[12px] font-mono focus:outline-none focus:border-white/30"
        />
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving || isLoading}
            className="bg-white text-black text-sm font-semibold px-4 py-2 hover:bg-neutral-200 disabled:opacity-50 cursor-pointer"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          {error && (
            <span className="text-xs text-red-400">
              {error?.response?.data?.message || error.message}
            </span>
          )}
        </div>
      </form>
    </AdminLayout>
  );
}

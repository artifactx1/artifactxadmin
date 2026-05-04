import { useState, useEffect } from "react";
import useSWR from "swr";
import AdminLayout from "@/components/admin-layout";
import api, { fetcher } from "@/lib/api";

export default function Billboard() {
  const { data, error, mutate, isLoading } = useSWR("/billboard", fetcher);
  const billboard = data?.billboard || data;

  const [form, setForm] = useState({ title: "", subtitle: "", image: "", link: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (billboard) {
      setForm({
        title: billboard.title || "",
        subtitle: billboard.subtitle || "",
        image: billboard.image || "",
        link: billboard.link || "",
      });
    }
  }, [billboard]);

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/billboard", form);
      mutate();
    } catch (err) {
      alert(err?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Featured / Billboard">
      <form
        onSubmit={onSave}
        className="bg-ink-900 border border-white/[0.06] p-5 max-w-3xl flex flex-col gap-4"
      >
        {form.image && (
          <div className="aspect-[3/1] bg-ink-800 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={form.image} alt="" className="w-full h-full object-cover" />
          </div>
        )}

        <Input
          label="Title"
          value={form.title}
          onChange={(v) => setForm((f) => ({ ...f, title: v }))}
        />
        <Input
          label="Subtitle"
          value={form.subtitle}
          onChange={(v) => setForm((f) => ({ ...f, subtitle: v }))}
        />
        <Input
          label="Image URL"
          value={form.image}
          onChange={(v) => setForm((f) => ({ ...f, image: v }))}
          placeholder="https://…"
        />
        <Input
          label="Link"
          value={form.link}
          onChange={(v) => setForm((f) => ({ ...f, link: v }))}
          placeholder="/collection/ethereum/0x…"
        />

        <button
          type="submit"
          disabled={saving}
          className="self-start bg-white text-black text-sm font-semibold px-4 py-2 hover:bg-neutral-200 disabled:opacity-50 cursor-pointer"
        >
          {saving ? "Saving…" : "Save"}
        </button>

        {error && (
          <div className="text-xs text-red-400">
            {error?.response?.data?.message || error.message}
          </div>
        )}
        {isLoading && !billboard && (
          <div className="text-xs text-neutral-600">Loading…</div>
        )}
      </form>
    </AdminLayout>
  );
}

const Input = ({ label, value, onChange, placeholder }) => (
  <label className="flex flex-col gap-1">
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

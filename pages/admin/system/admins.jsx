import { useState } from "react";
import useSWR from "swr";
import AdminLayout from "@/components/admin-layout";
import api, { fetcher } from "@/lib/api";

export default function AdminUsers() {
  const { data, error, mutate, isLoading } = useSWR("/admin/list", fetcher);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "admin",
  });

  const onCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post("/admin/create", form);
      setForm({ username: "", email: "", password: "", role: "admin" });
      mutate();
    } catch (err) {
      alert(err?.response?.data?.message || "Create failed");
    } finally {
      setCreating(false);
    }
  };

  return (
    <AdminLayout title="Admin users">
      <div className="flex flex-col gap-6">
        <div className="bg-ink-900 border border-white/[0.06]">
          <table className="w-full text-[13px]">
            <thead className="bg-ink-800">
              <tr>
                <th className="px-3 py-2 text-left text-[10px] uppercase tracking-[0.18em] text-neutral-500">
                  Username
                </th>
                <th className="px-3 py-2 text-left text-[10px] uppercase tracking-[0.18em] text-neutral-500">
                  Email
                </th>
                <th className="px-3 py-2 text-left text-[10px] uppercase tracking-[0.18em] text-neutral-500">
                  Role
                </th>
                <th className="px-3 py-2 text-left text-[10px] uppercase tracking-[0.18em] text-neutral-500">
                  Active
                </th>
                <th className="px-3 py-2 text-left text-[10px] uppercase tracking-[0.18em] text-neutral-500">
                  Last login
                </th>
              </tr>
            </thead>
            <tbody>
              {(data?.admins || []).map((a) => (
                <tr key={a.id} className="border-t border-white/[0.04]">
                  <td className="px-3 py-2 text-white">{a.username}</td>
                  <td className="px-3 py-2 text-neutral-400">{a.email}</td>
                  <td className="px-3 py-2 text-neutral-400">{a.role}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-block px-1.5 py-0.5 text-[10px] uppercase tracking-[0.14em] ${
                        a.is_active
                          ? "bg-emerald-900/40 text-emerald-300"
                          : "bg-white/[0.04] text-neutral-600"
                      }`}
                    >
                      {a.is_active ? "active" : "inactive"}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-neutral-500 text-[11px]">
                    {a.last_login ? new Date(a.last_login).toLocaleString() : "never"}
                  </td>
                </tr>
              ))}
              {!data?.admins?.length && !isLoading && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-neutral-600">
                    No admin users
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <form
          onSubmit={onCreate}
          className="bg-ink-900 border border-white/[0.06] p-5 flex flex-col gap-3 max-w-2xl"
        >
          <h2 className="text-[11px] uppercase tracking-[0.22em] text-neutral-500">
            Create admin
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Username"
              value={form.username}
              onChange={(v) => setForm((f) => ({ ...f, username: v }))}
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(v) => setForm((f) => ({ ...f, email: v }))}
            />
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={(v) => setForm((f) => ({ ...f, password: v }))}
            />
            <label className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-[0.18em] text-neutral-600">
                Role
              </span>
              <select
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                className="bg-ink-800 border border-white/[0.06] px-2 py-1.5 text-[13px] focus:outline-none focus:border-white/30"
              >
                <option value="admin" className="bg-ink-800">admin</option>
                <option value="moderator" className="bg-ink-800">moderator</option>
                <option value="super_admin" className="bg-ink-800">super_admin</option>
              </select>
            </label>
          </div>
          <button
            type="submit"
            disabled={creating}
            className="self-start bg-white text-black text-sm font-semibold px-4 py-2 hover:bg-neutral-200 disabled:opacity-50 cursor-pointer"
          >
            {creating ? "Creating…" : "Create"}
          </button>
        </form>

        {error && (
          <div className="text-xs text-red-400">
            {error?.response?.data?.message || error.message}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

const Input = ({ label, value, onChange, type = "text" }) => (
  <label className="flex flex-col gap-1">
    <span className="text-[10px] uppercase tracking-[0.18em] text-neutral-600">
      {label}
    </span>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-ink-800 border border-white/[0.06] px-3 py-1.5 text-[13px] focus:outline-none focus:border-white/30"
      required
    />
  </label>
);

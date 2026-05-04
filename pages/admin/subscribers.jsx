import useSWR from "swr";
import AdminLayout from "@/components/admin-layout";
import { fetcher } from "@/lib/api";

export default function Subscribers() {
  const { data, error, isLoading } = useSWR("/get-all-subscriber-email", fetcher);

  return (
    <AdminLayout title="Subscribers">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-[12px] text-neutral-500">
            {data ? `${data?.length ?? data?.emails?.length ?? 0} subscribers` : "—"}
          </p>
          <a
            href="/api/admin/subscribers/export.csv"
            className="px-3 py-1.5 text-[12px] border border-white/[0.06] hover:bg-white/[0.04] cursor-pointer"
          >
            Download CSV
          </a>
        </div>

        <div className="bg-ink-900 border border-white/[0.06]">
          <table className="w-full text-[13px]">
            <thead className="bg-ink-800">
              <tr>
                <th className="px-3 py-2 text-left text-[10px] uppercase tracking-[0.18em] text-neutral-500">
                  Email
                </th>
                <th className="px-3 py-2 text-left text-[10px] uppercase tracking-[0.18em] text-neutral-500">
                  Subscribed
                </th>
              </tr>
            </thead>
            <tbody>
              {(Array.isArray(data) ? data : data?.emails || []).map((row, idx) => (
                <tr key={row.id || row.email || idx} className="border-t border-white/[0.04]">
                  <td className="px-3 py-2 text-neutral-300">
                    {row.email || row}
                  </td>
                  <td className="px-3 py-2 text-neutral-500 text-[11px]">
                    {row.created_at ? new Date(row.created_at).toLocaleString() : "—"}
                  </td>
                </tr>
              ))}
              {!data && !isLoading && (
                <tr>
                  <td colSpan={2} className="px-3 py-6 text-center text-neutral-600">
                    {error ? "Failed to load" : "No subscribers"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

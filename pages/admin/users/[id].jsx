import { useRouter } from "next/router";
import useSWR from "swr";
import AdminLayout from "@/components/admin-layout";
import api, { fetcher } from "@/lib/api";

const Field = ({ label, children }) => (
  <div className="flex flex-col gap-1">
    <span className="text-[10px] uppercase tracking-[0.18em] text-neutral-600">
      {label}
    </span>
    <span className="text-[13px] text-neutral-200 break-all">{children ?? "—"}</span>
  </div>
);

const FlagToggle = ({ label, value, onChange, danger }) => (
  <button
    onClick={() => onChange(!value)}
    className={`px-3 py-2 text-[12px] uppercase tracking-[0.14em] border transition-colors cursor-pointer ${
      value
        ? danger
          ? "bg-red-900/40 border-red-900/60 text-red-200"
          : "bg-emerald-900/40 border-emerald-900/60 text-emerald-200"
        : "bg-ink-800 border-white/[0.06] text-neutral-500 hover:text-white"
    }`}
  >
    {label}: {value ? "ON" : "OFF"}
  </button>
);

export default function UserDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { data, error, mutate, isLoading } = useSWR(
    id ? `/admin/end-users/${id}` : null,
    fetcher
  );
  const u = data?.user;

  const updateFlag = async (key, value) => {
    try {
      await api.patch(`/admin/end-users/${id}/flags`, { [key]: value });
      mutate();
    } catch (err) {
      alert(err?.response?.data?.error || "Update failed");
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="User">
        <div className="text-sm text-neutral-600">Loading…</div>
      </AdminLayout>
    );
  }
  if (error || !u) {
    return (
      <AdminLayout title="User">
        <div className="text-sm text-red-400">
          {error?.response?.data?.error || "User not found"}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={u.user_name || u.wallet_address}>
      <div className="flex flex-col gap-6">
        <div className="bg-ink-900 border border-white/[0.06] p-5 flex gap-5">
          {u.profile_img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={u.profile_img} alt="" className="w-24 h-24 rounded-full bg-ink-700 shrink-0" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-ink-700 shrink-0" />
          )}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4">
            <Field label="Username">{u.user_name}</Field>
            <Field label="Wallet">{u.wallet_address}</Field>
            <Field label="Email">{u.email}</Field>
            <Field label="Bio">{u.bio || "—"}</Field>
            <Field label="Created">
              {u.created_at ? new Date(u.created_at).toLocaleString() : "—"}
            </Field>
            <Field label="Collections created">{data?.stats?.collections_created}</Field>
            <Field label="NFTs owned">{data?.stats?.nfts_owned}</Field>
          </div>
        </div>

        <div className="bg-ink-900 border border-white/[0.06] p-5 flex flex-col gap-3">
          <h2 className="text-[11px] uppercase tracking-[0.22em] text-neutral-500">
            Moderation flags
          </h2>
          <div className="flex flex-wrap gap-2">
            <FlagToggle
              label="Verified"
              value={!!u.is_verified}
              onChange={(v) => updateFlag("is_verified", v)}
            />
            <FlagToggle
              label="Suspended"
              value={!!u.is_suspended}
              onChange={(v) => {
                if (
                  !u.is_suspended &&
                  !confirm(
                    "Suspend this user? They will be unable to sign in."
                  )
                )
                  return;
                updateFlag("is_suspended", v);
              }}
              danger
            />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

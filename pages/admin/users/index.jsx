import { useState } from "react";
import useSWR from "swr";
import AdminLayout from "@/components/admin-layout";
import { MonoAddress, StatusPill } from "@/components/data-table";
import { ListShell, TextFilter, SelectFilter, TRI_OPTIONS } from "@/components/list-shell";
import { fetcher } from "@/lib/api";

export default function UsersList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isVerified, setIsVerified] = useState("all");
  const [isSuspended, setIsSuspended] = useState("all");

  const params = new URLSearchParams({ page: String(page), pageSize: "50" });
  if (search.trim()) params.set("search", search.trim());
  if (isVerified !== "all") params.set("isVerified", isVerified);
  if (isSuspended !== "all") params.set("isSuspended", isSuspended);

  const { data, error, isLoading } = useSWR(
    `/admin/end-users?${params.toString()}`,
    fetcher,
    { keepPreviousData: true }
  );

  const columns = [
    {
      key: "profile_img",
      label: "",
      width: 40,
      render: (r) =>
        r.profile_img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={r.profile_img} alt="" className="w-7 h-7 rounded-full bg-ink-700" />
        ) : (
          <div className="w-7 h-7 rounded-full bg-ink-700" />
        ),
    },
    {
      key: "user_name",
      label: "User",
      render: (r) => (
        <div className="flex flex-col">
          <span className="text-white">{r.user_name || "(no username)"}</span>
          <MonoAddress value={r.wallet_address} />
        </div>
      ),
    },
    { key: "email", label: "Email" },
    {
      key: "is_verified",
      label: "Verified",
      render: (r) => <StatusPill active={r.is_verified} />,
    },
    {
      key: "is_suspended",
      label: "Suspended",
      render: (r) => (
        <StatusPill
          active={r.is_suspended}
          activeClass="bg-red-900/40 text-red-300"
        />
      ),
    },
    {
      key: "created_at",
      label: "Created",
      render: (r) => (
        <span className="text-neutral-500 text-[11px]">
          {r.created_at ? new Date(r.created_at).toLocaleDateString() : "—"}
        </span>
      ),
    },
  ];

  return (
    <AdminLayout title="Users">
      <ListShell
        csvUrl={`/api/admin/end-users?${(() => {
          const p = new URLSearchParams(params);
          p.set("format", "csv");
          return p.toString();
        })()}`}
        filters={
          <>
            <TextFilter
              label="Search username / wallet / email"
              value={search}
              onChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              width={320}
            />
            <SelectFilter
              label="Verified"
              value={isVerified}
              onChange={(v) => {
                setIsVerified(v);
                setPage(1);
              }}
              options={TRI_OPTIONS}
            />
            <SelectFilter
              label="Suspended"
              value={isSuspended}
              onChange={(v) => {
                setIsSuspended(v);
                setPage(1);
              }}
              options={TRI_OPTIONS}
            />
          </>
        }
        columns={columns}
        rows={data?.users}
        total={data?.total}
        page={page}
        onPageChange={setPage}
        isLoading={isLoading}
        error={error}
        onRowClick={(r) => {
          window.location.href = `/admin/users/${r.id}`;
        }}
      />
    </AdminLayout>
  );
}

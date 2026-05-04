import { useRouter } from "next/router";
import AdminLayout from "@/components/admin-layout";
import Placeholder from "@/components/placeholder";

export default function DropDetail() {
  const { query } = useRouter();
  return (
    <AdminLayout title={`Drop · ${query.address || ""}`}>
      <Placeholder
        title="Drop detail"
        description="Tabs: Overview · Claim phases · Allowlist · Mints · Minting page · Diagnostics."
      />
    </AdminLayout>
  );
}

import { useRouter } from "next/router";
import AdminLayout from "@/components/admin-layout";
import Placeholder from "@/components/placeholder";

export default function UserDetail() {
  const { query } = useRouter();
  return (
    <AdminLayout title={`User · ${query.id || ""}`}>
      <Placeholder
        title="User detail"
        description="Profile, owned NFTs, created collections, activity, reports filed by/against."
      />
    </AdminLayout>
  );
}

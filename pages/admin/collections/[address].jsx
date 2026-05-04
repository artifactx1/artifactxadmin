import { useRouter } from "next/router";
import AdminLayout from "@/components/admin-layout";
import Placeholder from "@/components/placeholder";

export default function CollectionDetail() {
  const { query } = useRouter();
  return (
    <AdminLayout title={`Collection · ${query.address || ""}`}>
      <Placeholder
        title="Collection detail"
        description="Tabs: Overview · NFTs · Listings · Activity · Stats · Pages · Danger zone."
      />
    </AdminLayout>
  );
}

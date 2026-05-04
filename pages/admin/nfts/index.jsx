import AdminLayout from "@/components/admin-layout";
import Placeholder from "@/components/placeholder";

export default function NftsList() {
  return (
    <AdminLayout title="NFTs">
      <Placeholder
        title="NFTs list"
        description="Per-token management. Refresh metadata, force-recompute thumbnail, hide token, inspect raw Alchemy response for diagnosing blurry/missing images."
      />
    </AdminLayout>
  );
}

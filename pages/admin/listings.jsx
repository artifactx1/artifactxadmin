import AdminLayout from "@/components/admin-layout";
import Placeholder from "@/components/placeholder";

export default function Listings() {
  return (
    <AdminLayout title="Listings">
      <Placeholder
        title="Active and expired listings"
        description="Filter by collection, seller, price range. SUPER_ADMIN can cancel listings without seller signature for moderation."
      />
    </AdminLayout>
  );
}

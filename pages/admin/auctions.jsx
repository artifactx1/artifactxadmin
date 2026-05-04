import AdminLayout from "@/components/admin-layout";
import Placeholder from "@/components/placeholder";

export default function Auctions() {
  return (
    <AdminLayout title="Auctions">
      <Placeholder
        title="Auctions"
        description="Live, ended, pending settlement. Force-settle / cancel for SUPER_ADMIN."
      />
    </AdminLayout>
  );
}

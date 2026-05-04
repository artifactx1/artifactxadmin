import AdminLayout from "@/components/admin-layout";
import Placeholder from "@/components/placeholder";

export default function Subscribers() {
  return (
    <AdminLayout title="Subscribers">
      <Placeholder
        title="Email subscriber list"
        description="List, export CSV, unsubscribe."
      />
    </AdminLayout>
  );
}

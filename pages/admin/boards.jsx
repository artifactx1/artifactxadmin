import AdminLayout from "@/components/admin-layout";
import Placeholder from "@/components/placeholder";

export default function Boards() {
  return (
    <AdminLayout title="Boards">
      <Placeholder
        title="User boards"
        description="Curated boards. Soft-delete spam, feature on home."
      />
    </AdminLayout>
  );
}

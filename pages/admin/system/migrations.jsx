import AdminLayout from "@/components/admin-layout";
import Placeholder from "@/components/placeholder";

export default function Migrations() {
  return (
    <AdminLayout title="Migrations">
      <Placeholder
        title="Schema migrations"
        description="Applied / pending migration tracker."
      />
    </AdminLayout>
  );
}

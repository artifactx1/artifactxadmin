import AdminLayout from "@/components/admin-layout";
import Placeholder from "@/components/placeholder";

export default function Takedowns() {
  return (
    <AdminLayout title="Takedowns">
      <Placeholder
        title="Soft-hidden content"
        description="Everything currently is_deactivated. Restore / view history."
      />
    </AdminLayout>
  );
}

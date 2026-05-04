import AdminLayout from "@/components/admin-layout";
import Placeholder from "@/components/placeholder";

export default function AdminUsers() {
  return (
    <AdminLayout title="Admin users">
      <Placeholder
        title="Admin user management"
        description="List, create, toggle active, reset password. SUPER_ADMIN only."
      />
    </AdminLayout>
  );
}

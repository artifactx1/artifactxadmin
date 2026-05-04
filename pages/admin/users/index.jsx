import AdminLayout from "@/components/admin-layout";
import Placeholder from "@/components/placeholder";

export default function UsersList() {
  return (
    <AdminLayout title="Users">
      <Placeholder
        title="Users list"
        description="End-user accounts (not admin users). Verify, suspend, dedupe, GDPR-delete."
      />
    </AdminLayout>
  );
}

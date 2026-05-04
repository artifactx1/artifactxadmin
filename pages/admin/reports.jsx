import AdminLayout from "@/components/admin-layout";
import Placeholder from "@/components/placeholder";

export default function Reports() {
  return (
    <AdminLayout title="Reports">
      <Placeholder
        title="Reports queue"
        description="Triage user reports: dismiss, deactivate target, mark resolved."
      />
    </AdminLayout>
  );
}

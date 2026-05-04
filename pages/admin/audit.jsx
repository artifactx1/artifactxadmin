import AdminLayout from "@/components/admin-layout";
import Placeholder from "@/components/placeholder";

export default function AuditLog() {
  return (
    <AdminLayout title="Audit log">
      <Placeholder
        title="Admin audit log"
        description="Read-only. Every state-changing admin action with before/after snapshots."
      />
    </AdminLayout>
  );
}

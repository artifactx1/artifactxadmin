import AdminLayout from "@/components/admin-layout";
import Placeholder from "@/components/placeholder";

export default function Jobs() {
  return (
    <AdminLayout title="Background jobs">
      <Placeholder
        title="Job runner"
        description="Long ops (reindex, backfill, refresh) tracked with status, progress, result. Replaces scattered CLI scripts."
      />
    </AdminLayout>
  );
}

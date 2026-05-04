import AdminLayout from "@/components/admin-layout";
import Placeholder from "@/components/placeholder";

export default function DropsList() {
  return (
    <AdminLayout title="Drops">
      <Placeholder
        title="Drops list"
        description="Filtered to is_drop=true with phase status (Live / Upcoming / Ended / No phases). Each row links to the detail view including the diagnostics tab — the killer feature for answering 'why isn't my drop showing?'."
      />
    </AdminLayout>
  );
}

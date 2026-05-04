import AdminLayout from "@/components/admin-layout";
import Placeholder from "@/components/placeholder";

export default function Boards() {
  return (
    <AdminLayout title="Boards">
      <Placeholder
        title="User-curated boards"
        description="Soft-delete + feature-on-home actions land in a follow-up. Tracked in ADMIN_PANEL_SPEC.md §4.10.2."
      />
    </AdminLayout>
  );
}

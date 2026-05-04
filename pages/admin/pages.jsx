import AdminLayout from "@/components/admin-layout";
import Placeholder from "@/components/placeholder";

export default function PagesList() {
  return (
    <AdminLayout title="Page Builder pages">
      <Placeholder
        title="Page Builder pages"
        description="The page-builder editor lives in creator-studio. Admin override of pages requires wiring through the existing /pageBuilder/* endpoints — implementing list + admin-edit override is a follow-up. Tracked in ADMIN_PANEL_SPEC.md §4.10.1."
      />
    </AdminLayout>
  );
}

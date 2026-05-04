import AdminLayout from "@/components/admin-layout";
import Placeholder from "@/components/placeholder";

export default function PagesList() {
  return (
    <AdminLayout title="Page Builder pages">
      <Placeholder
        title="Page Builder pages"
        description="All page_builder_pages rows. Admin override edit, publish / unpublish, revert."
      />
    </AdminLayout>
  );
}

import AdminLayout from "@/components/admin-layout";
import Placeholder from "@/components/placeholder";

export default function Billboard() {
  return (
    <AdminLayout title="Featured / Billboard">
      <Placeholder
        title="Billboard editor"
        description="Image upload + preview. Wired to existing PUT /billboard."
      />
    </AdminLayout>
  );
}

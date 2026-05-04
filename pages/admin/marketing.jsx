import AdminLayout from "@/components/admin-layout";
import Placeholder from "@/components/placeholder";

export default function Marketing() {
  return (
    <AdminLayout title="Marketing inputs">
      <Placeholder
        title="Marketing inputs"
        description="Free-form text/image inputs surfaced on the marketing site. Wired to existing PUT /marketing."
      />
    </AdminLayout>
  );
}

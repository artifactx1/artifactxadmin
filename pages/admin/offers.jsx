import AdminLayout from "@/components/admin-layout";
import Placeholder from "@/components/placeholder";

export default function Offers() {
  return (
    <AdminLayout title="Offers">
      <Placeholder
        title="Offers"
        description="Active, expired, accepted, cancelled. Mostly read-only; admin cancel for spam."
      />
    </AdminLayout>
  );
}

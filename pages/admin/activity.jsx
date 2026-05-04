import AdminLayout from "@/components/admin-layout";
import Placeholder from "@/components/placeholder";

export default function Activity() {
  return (
    <AdminLayout title="Activity & Volume">
      <Placeholder
        title="Activity log"
        description="Direct view of the activities table. Includes 'Why is volume zero?' and 'Why is floor wrong?' diagnostics that replace the inspectTrendingVolumes / inspectFloorPrice scripts."
      />
    </AdminLayout>
  );
}

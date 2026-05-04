import AdminLayout from "@/components/admin-layout";
import Placeholder from "@/components/placeholder";

export default function CollectionsList() {
  return (
    <AdminLayout title="Collections">
      <Placeholder
        title="Collections list"
        description="Paginated table of every collection (drops + non-drops). Filters: network, type, is_drop, is_featured, is_historical, is_deactivated. Click into a row for the detail view with NFTs, listings, activity, stats, pages, and danger-zone tabs."
      />
    </AdminLayout>
  );
}

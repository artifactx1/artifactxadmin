import AdminLayout from "@/components/admin-layout";
import Placeholder from "@/components/placeholder";

export default function IndexerState() {
  return (
    <AdminLayout title="Indexer state">
      <Placeholder
        title="Indexer state per chain"
        description="last_block, updated_at, lag, status. Replay-from-block and pause/resume controls."
      />
    </AdminLayout>
  );
}

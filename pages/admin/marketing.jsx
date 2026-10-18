import Link from "next/link";
import AdminLayout from "@/components/admin-layout";

export default function Marketing() {
  return (
    <AdminLayout title="Marketing inputs retired">
      <div className="flex flex-col gap-4 max-w-2xl">
        <p role="status" className="text-sm text-neutral-300">
          The legacy marketing JSON service has been retired. This page can no
          longer load or save marketing inputs.
        </p>
        <p className="text-sm text-neutral-500">
          Existing links to this page remain available for reference. For current
          merchandising controls, use the collection and billboard tools below.
        </p>
        <div className="flex flex-wrap gap-4 text-sm">
          <Link href="/admin/billboard" className="text-white underline">
            Featured / Billboard
          </Link>
          <Link href="/admin/collections" className="text-white underline">
            Collections
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}

import { useAdminSession } from "@/lib/auth";
import Sidebar from "./sidebar";
import Topbar from "./topbar";

// Wrap every admin page with this. It enforces session, renders chrome, and
// passes the resolved admin into children via render-prop if needed.
export default function AdminLayout({ title, children }) {
  const { admin, loading } = useAdminSession();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-neutral-600 text-sm">
        Loading session…
      </div>
    );
  }

  if (!admin) {
    // useAdminSession already redirected to /login.
    return null;
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar admin={admin} />
        <main className="flex-1 overflow-y-auto">
          {title && (
            <div className="border-b border-white/[0.06] bg-ink-900 px-6 py-4">
              <h1 className="text-base font-semibold text-white">{title}</h1>
            </div>
          )}
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

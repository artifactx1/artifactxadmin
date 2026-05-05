import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAdminSession } from "@/lib/auth";
import Sidebar from "./sidebar";
import Topbar from "./topbar";

// Wrap every admin page with this. It enforces session, renders chrome, and
// passes the resolved admin into children via render-prop if needed.
export default function AdminLayout({ title, children }) {
  const { admin, loading } = useAdminSession();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { pathname } = useRouter();

  // Close the mobile drawer when the route changes.
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

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
      <Sidebar open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar admin={admin} onMenuClick={() => setDrawerOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          {title && (
            <div className="border-b border-white/[0.06] bg-ink-900 px-4 md:px-6 py-3 md:py-4">
              <h1 className="text-base font-semibold text-white">{title}</h1>
            </div>
          )}
          <div className="p-3 md:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

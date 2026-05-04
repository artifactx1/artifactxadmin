import Link from "next/link";
import { useRouter } from "next/router";

// Navigation tree mirrors ADMIN_PANEL_SPEC.md section 3.3.
const NAV = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Collections", href: "/admin/collections" },
  { label: "Drops", href: "/admin/drops" },
  { label: "NFTs", href: "/admin/nfts" },
  {
    label: "Marketplace",
    children: [
      { label: "Listings", href: "/admin/listings" },
      { label: "Auctions", href: "/admin/auctions" },
      { label: "Offers", href: "/admin/offers" },
    ],
  },
  { label: "Activity & Volume", href: "/admin/activity" },
  { label: "Users", href: "/admin/users" },
  {
    label: "Moderation",
    children: [
      { label: "Reports", href: "/admin/reports" },
      { label: "Takedowns", href: "/admin/takedowns" },
    ],
  },
  {
    label: "Merchandising",
    children: [
      { label: "Featured / Billboard", href: "/admin/billboard" },
      { label: "Recommendations", href: "/admin/recommendations" },
      { label: "Marketing inputs", href: "/admin/marketing" },
    ],
  },
  {
    label: "Pages",
    children: [
      { label: "Page Builder pages", href: "/admin/pages" },
      { label: "Boards", href: "/admin/boards" },
    ],
  },
  { label: "Subscribers", href: "/admin/subscribers" },
  {
    label: "System",
    children: [
      { label: "Indexer state", href: "/admin/system/indexer" },
      { label: "Background jobs", href: "/admin/system/jobs" },
      { label: "Migrations", href: "/admin/system/migrations" },
      { label: "Admin users", href: "/admin/system/admins" },
      { label: "SQL console", href: "/admin/system/sql" },
      { label: "Two-factor auth", href: "/admin/system/2fa" },
    ],
  },
  { label: "Audit log", href: "/admin/audit" },
];

const isActive = (href, pathname) =>
  href === pathname || (href !== "/admin/dashboard" && pathname.startsWith(href));

const SectionLabel = ({ children }) => (
  <span className="px-3 mt-5 mb-1 text-[10px] uppercase tracking-[0.22em] text-neutral-600">
    {children}
  </span>
);

const NavLink = ({ item, pathname, indent = false }) => (
  <Link
    href={item.href}
    className={`block px-3 py-1.5 text-[13px] transition-colors ${
      indent ? "pl-6" : ""
    } ${
      isActive(item.href, pathname)
        ? "bg-white/[0.06] text-white"
        : "text-neutral-400 hover:text-white hover:bg-white/[0.03]"
    }`}
  >
    {item.label}
  </Link>
);

export default function Sidebar() {
  const { pathname } = useRouter();
  return (
    <nav className="w-[240px] shrink-0 border-r border-white/[0.06] bg-ink-900 flex flex-col py-3 overflow-y-auto">
      <Link href="/admin/dashboard" className="px-3 mb-3 flex flex-col gap-0.5">
        <span className="text-[10px] uppercase tracking-[0.28em] text-neutral-600">
          Artifactx
        </span>
        <span className="text-sm font-bold text-white">Admin</span>
      </Link>

      {NAV.map((item) =>
        item.children ? (
          <div key={item.label} className="flex flex-col">
            <SectionLabel>{item.label}</SectionLabel>
            {item.children.map((c) => (
              <NavLink key={c.href} item={c} pathname={pathname} indent />
            ))}
          </div>
        ) : (
          <NavLink key={item.href} item={item} pathname={pathname} />
        )
      )}
    </nav>
  );
}

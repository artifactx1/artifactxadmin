import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import api from "./api";

// Hook that hydrates the current admin from GET /admin/me. Redirects to
// /login when the session is missing or expired. Use it at the top of
// every protected page; the AdminLayout wrapper does this for you.
export function useAdminSession({ redirectIfUnauthed = true } = {}) {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api
      .get("/admin/me")
      .then((res) => {
        if (cancelled) return;
        setAdmin(res.data?.admin || res.data || null);
      })
      .catch(() => {
        if (cancelled) return;
        setAdmin(null);
        if (redirectIfUnauthed) router.replace("/login");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [redirectIfUnauthed, router]);

  return { admin, loading };
}

export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  MODERATOR: "MODERATOR",
};

const ROLE_RANK = {
  [ROLES.SUPER_ADMIN]: 3,
  [ROLES.ADMIN]: 2,
  [ROLES.MODERATOR]: 1,
};

// Returns true if the admin's role meets the minimum required.
export function hasRole(admin, minRole) {
  if (!admin?.role) return false;
  return (ROLE_RANK[admin.role] || 0) >= (ROLE_RANK[minRole] || 0);
}

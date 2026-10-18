// Navigation must follow a confirmed cookie-clearing response. A rejected
// request leaves the user on the admin page so the failure cannot look like logout.
export async function signOutAdmin(client, navigate) {
  await client.post("/admin/logout");
  await navigate("/login");
}

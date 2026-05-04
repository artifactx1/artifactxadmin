/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Server proxies /api/* through to the ElementServer API. Keeps admin
  // session cookies same-origin and avoids CORS in dev.
  async rewrites() {
    const api = process.env.ELEMENT_SERVER_URL || "http://localhost:3000";
    return [{ source: "/api/:path*", destination: `${api}/:path*` }];
  },
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Server proxies /api/* through to the ElementServer API. Keeps admin
  // session cookies same-origin and avoids CORS in dev.
  async rewrites() {
    const api =
      process.env.BACKEND_URL ||
      process.env.ELEMENT_SERVER_URL ||
      "http://localhost:5001";
    if (process.env.NODE_ENV === "production" && !process.env.BACKEND_URL && !process.env.ELEMENT_SERVER_URL) {
      throw new Error("BACKEND_URL must be set in production");
    }
    return [{ source: "/api/:path*", destination: `${api}/:path*` }];
  },
};

module.exports = nextConfig;

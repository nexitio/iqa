import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hostnames, not origins: Next matches the `Origin` header's hostname alone.
  // `localhost` is always allowed; anything else the app is opened as in
  // development has to be listed here, or the dev server answers its own
  // dev-only endpoints (the HMR socket among them) with 403 and the page loads
  // fully rendered but never hydrates — buttons do nothing and forms submit
  // natively. 127.0.0.1 is the same machine as localhost, so it is safe here.
  allowedDevOrigins: ['10.20.30.20', '127.0.0.1'],
};

export default nextConfig;

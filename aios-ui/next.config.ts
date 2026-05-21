import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow non-localhost hostnames in dev. Without this, Next blocks
  // cross-origin requests to dev-only endpoints (HMR, RSC payloads,
  // internal /_next/*), which breaks /api/chat/... fetches when the
  // page is loaded from a hostname other than `localhost`.
  // See: node_modules/next/dist/docs/.../allowedDevOrigins.md
  allowedDevOrigins: ['aios.localapp'],
};

export default nextConfig;
